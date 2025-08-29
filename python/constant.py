import utils
from ortools.sat.python import cp_model
import room_definition as rd
import config

def add_non_overlap_constraints(room_list, model, room_positions):
    """制約1: 部屋が重ならないようにする（同じ階の部屋のみ。ただし廊下は重なり可）"""
    for i in range(len(room_list)):
        for j in range(i + 1, len(room_list)):
            room_i = room_list[i]
            room_j = room_list[j]
            if room_i.floor == room_j.floor:
                utils._add_non_overlap_for_room_pair(model, room_positions, i, j)

def add_adjacency_constraints(room_list, model, room_positions,config, SCALING_FACTOR):
    """制約2: 接続関係にある部屋は隣接している必要がある（同じ階のみ）"""
    for i in range(len(room_list)):
        if room_list[i].name == "廊下" or room_list[i].name == "副廊下":
            continue
        for j in range(i+1,len(room_list)):
            if room_list[j].name == "廊下" or room_list[j].name == "副廊下":
                continue                
            if i == j:
                continue
            if room_list[j].name in config.ROOM_CONFIG[room_list[i].name]["connections"]:
                utils._add_adjacency_for_room_pair(model, room_positions, i, j, SCALING_FACTOR)

def add_distance_minimization(room_list, model, room_positions, land_width_scaled, land_depth_scaled, config):
    """制約3: 接続関係にある部屋同士のマンハッタン距離の合計を最小化（同じ階のみ）"""
    adj_distance_vars = []
    for i, room_i in enumerate(room_list):
        if room_i.name not in config.ROOM_CONFIG or "connections" not in config.ROOM_CONFIG[room_i.name]:
            continue
                
        for j in range(i + 1, len(room_list)):
            room_j = room_list[j]
            if room_j.name in config.ROOM_CONFIG[room_i.name]["connections"]:
                if room_i.floor != room_j.floor:
                    continue
                    
                distance_vars = utils._add_distance_vars_for_room_pair(
                    model, room_positions, i, j, land_width_scaled, land_depth_scaled)
                adj_distance_vars.extend(distance_vars)
        
    return adj_distance_vars

def add_stairs_alignment_constraints(room_list, model, room_positions):
    """制約4: 一階と二階の階段の位置を一致させる"""
    stairs1_idx = None
    stairs2_idx = None
        
    for i, room in enumerate(room_list):
        if room.name == "階段1":
            stairs1_idx = i
        elif room.name == "階段2":
            stairs2_idx = i
        
    if stairs1_idx is not None and stairs2_idx is not None:
        model.Add(room_positions[stairs1_idx]['x'] == room_positions[stairs2_idx]['x'])
        model.Add(room_positions[stairs1_idx]['y'] == room_positions[stairs2_idx]['y'])

def add_entrance_edge_constraints(room_list, model, room_positions, land_width_scaled, land_depth_scaled, SCALING_FACTOR):
    """制約5: エントランスは外周に接する"""
    entrance_idx = None
    for i, room in enumerate(room_list):
        if room.name == "エントランス":
            entrance_idx = i
            break
        
    if entrance_idx is not None:
        _add_entrance_edge_constraint(
            room_list, model, room_positions, entrance_idx, land_width_scaled, land_depth_scaled, SCALING_FACTOR)

def _add_entrance_edge_constraint(room_list, model, room_positions, entrance_idx, land_width_scaled, land_depth_scaled, SCALING_FACTOR):
    """エントランスが外周に接するための制約を追加"""
    entrance_x = room_positions[entrance_idx]['x']
    entrance_y = room_positions[entrance_idx]['y']
        
    # エントランスの幅と高さをスケーリングして取得
    entrance_room = room_list[entrance_idx]
    entrance_width_scaled = int(entrance_room.width * SCALING_FACTOR)
    entrance_height_scaled = int(entrance_room.height * SCALING_FACTOR)

    # 左端に接する
    on_left_edge = model.NewBoolVar(f'entrance_on_left_edge')
    model.Add(entrance_x == 0).OnlyEnforceIf(on_left_edge)

    # 右端に接する
    on_right_edge = model.NewBoolVar(f'entrance_on_right_edge')
    model.Add(entrance_x + entrance_width_scaled == land_width_scaled).OnlyEnforceIf(on_right_edge)

    # 下端に接する
    on_bottom_edge = model.NewBoolVar(f'entrance_on_bottom_edge')
    model.Add(entrance_y == 0).OnlyEnforceIf(on_bottom_edge)

    # 上端に接する
    on_top_edge = model.NewBoolVar(f'entrance_on_top_edge')
    model.Add(entrance_y + entrance_height_scaled == land_depth_scaled).OnlyEnforceIf(on_top_edge)

    # いずれかの端に接する必要がある
    model.AddBoolOr([on_left_edge, on_right_edge, on_bottom_edge, on_top_edge])

def add_second_floor_edge_constraints(room_list, model, room_positions, land_width_scaled, land_depth_scaled):
    """
    制約: 2階の全ての部屋（廊下を除く）は少なくとも1辺が外周壁に接する
    """
    for i, room in enumerate(room_list):
        # 2階の部屋かつ廊下でない部屋のみ対象
        if room.floor != 2 or "廊下" in room.name:
            continue
                
        # 部屋の座標と寸法
        room_x = room_positions[i]['x']
        room_y = room_positions[i]['y']
        room_w = room_positions[i]['w']
        room_h = room_positions[i]['h']
            
        # 左端に接する
        on_left_edge = model.NewBoolVar(f'room_{i}_on_left_edge')
        model.Add(room_x == 0).OnlyEnforceIf(on_left_edge)
            
        # 右端に接する
        on_right_edge = model.NewBoolVar(f'room_{i}_on_right_edge')
        model.Add(room_x + room_w == land_width_scaled).OnlyEnforceIf(on_right_edge)
            
        # 下端に接する
        on_bottom_edge = model.NewBoolVar(f'room_{i}_on_bottom_edge')
        model.Add(room_y == 0).OnlyEnforceIf(on_bottom_edge)
            
        # 上端に接する
        on_top_edge = model.NewBoolVar(f'room_{i}_on_top_edge')
        model.Add(room_y + room_h == land_depth_scaled).OnlyEnforceIf(on_top_edge)
            
        # いずれかの端に接する必要がある
        model.AddBoolOr([on_left_edge, on_right_edge, on_bottom_edge, on_top_edge])

def add_second_floor_area_maximization(room_list, model, room_positions, land_width_scaled, land_depth_scaled):
    """
    2階の階段と廊下を除くすべての部屋の面積を最大化するための制約を追加
    各部屋のvalueを重みとして優先順位をつける
    """
    # 2階の階段と廊下を除く各部屋の重み付き面積を計算
    weighted_areas = []
    second_floor_room_indices = []
    for i, room in enumerate(room_list):
        if "階段" not in room.name and "廊下" not in room.name:
            # 各部屋の面積を変数として定義
            area = model.NewIntVar(0, land_width_scaled * land_depth_scaled, f'area_{i}')
            model.AddMultiplicationEquality(area, [room_positions[i]['w'], room_positions[i]['h']])
            
            # 部屋のvalueを重みとして面積にかける
            room_value = room.value  # valueが無い場合は1をデフォルト値とする
            weighted_area = model.NewIntVar(0, land_width_scaled * land_depth_scaled * room_value, f'weighted_area_{i}')
            model.AddMultiplicationEquality(weighted_area, [area, room_value])
            
            weighted_areas.append(weighted_area)
            second_floor_room_indices.append(i)
    
    # 重み付き合計面積を計算
    total_area = None
    if weighted_areas:
        max_total = land_width_scaled * land_depth_scaled * sum(
            room.value 
            for i in second_floor_room_indices
        )
        total_area = model.NewIntVar(0, max_total, 'total_weighted_second_floor_area')
        model.Add(total_area == sum(weighted_areas))
    
    return total_area

def add_specific_room_south_constraint(room_list, model, room_positions, room_name):
    """特定の部屋を南側に配置するための制約を追加
    Args:
        model (cp_model.CpModel): OR-ToolsのCPモデル
        room_positions (dict): 各部屋の位置変数を格納する辞書
        room_name (str): 南側に配置したい部屋の名前
    """
    room_idx = None
    for i, room in enumerate(room_list):
        if room.name == room_name:
            room_idx = i  
            break    

    if room_idx is not None:
        model.Add(room_positions[room_idx]['y'] == 0)

def add_constrain_door_to_stair_access(room_list, model,SCALING_FACTOR):

    """
    階段のドアの位置を適切に配置するための制約を追加する．階段のパターンに応じて他の部屋と接続する位置を調整します。

    Args:
        model (cp_model.CpModel): OR-ToolsのCPモデル
        room_positions (dict): 各部屋の位置変数を格納する辞書
    """

    # 階段オブジェクトを格納する辞書を準備
    stair_floors = {}

    # 各階段オブジェクトの取得
    for room in room_list:
        # Stairsクラスのインスタンスのみを階数をキーとして辞書に格納
        if isinstance(room, rd.Stairs):
            stair_floors[room.get_floor()] = room

    # 各階の階段オブジェクトへのアクセス例
    stair_floor_1 = stair_floors.get(1)
    stair_floor_2 = stair_floors.get(2)

    # 両方の階の階段が存在しない場合は、制約を追加せずに終了
    if not stair_floor_1 or not stair_floor_2:
        print("両方の階に階段が見つからないため、階段のドア制約はスキップします。")
        return

    # 階段に接続する部屋のリストを取得
    # 階段に接続する部屋のリストを取得
    room_list_connecting_stairs_1 = stair_floor_1.get_connected_rooms() if stair_floor_1 else []
    room_list_connecting_stairs_2 = stair_floor_2.get_connected_rooms() if stair_floor_2 else []
    
    # 階段に接続するはやがらの部屋が存在しない場合は何もしない
    if not room_list_connecting_stairs_1 and not room_list_connecting_stairs_2:
        print("階段に接続する部屋が見つかりません．")
        return 

    if stair_floor_1.get_pattern() == "straight" and stair_floor_2.get_pattern() == "straight":
        
        # 階段が横向きの場合
        if stair_floor_1.width > stair_floor_1.height:

            """
            横向きの場合は東西で階段が部屋に接続されないといけない
            """

            # 接続する方向を示すブール変数を定義
            f1_connects_east = model.NewBoolVar('f1_connects_east')
            f1_connects_west = model.NewBoolVar('f1_connects_west')
            f2_connects_east = model.NewBoolVar('f2_connects_east')
            f2_connects_west = model.NewBoolVar('f2_connects_west')

            # 階段の接続の論理関係
            model.Add(f1_connects_east + f1_connects_west == 1)
            model.Add(f2_connects_east + f2_connects_west == 1)
            model.AddImplication(f1_connects_east, f2_connects_west)
            model.AddImplication(f1_connects_west, f2_connects_east)

            # 階段1の接続関係が満たされる制約を追加
            for room in room_list_connecting_stairs_1:
                
                # 階段の位置編集の取得
                x_i = stair_floor_1.get_x()
                y_i = stair_floor_1.get_y()
                w_i = stair_floor_1.get_width()
                h_i = stair_floor_1.get_height()
                
                # 接続部屋の位置編集の取得
                x_j = room.get_x()
                y_j = room.get_y()
                w_j = room.get_width()
                h_j = room.get_height()
                
                #　f1_connects_east が True ならば、東側で隣接する
                east_adjacent = model.NewBoolVar()
                model.Add(x_i + w_i == x_j).OnlyEnforceIf(east_adjacent)
                model.Add(y_i + SCALING_FACTOR <= y_j + h_j).OnlyEnforceIf(east_adjacent)
                model.Add(y_j + SCALING_FACTOR <= y_i + h_i).OnlyEnforceIf(east_adjacent)

                # f1_connects_west が True ならば、西側で隣接する
                west_adjacent = model.NewBoolVar()
                model.Add(x_j + w_j == x_i).OnlyEnforceIf(west_adjacent)
                model.Add(y_i + SCALING_FACTOR <= y_j + h_j).OnlyEnforceIf(west_adjacent)
                model.Add(y_j + SCALING_FACTOR <= y_i + h_i).OnlyEnforceIf(west_adjacent)

            # 階段2の接続関係が満たされる制約を追加
            for room in room_list_connecting_stairs_2:

                # 階段の位置編集の取得
                x_i = stair_floor_1.get_x()
                y_i = stair_floor_1.get_y()
                w_i = stair_floor_1.get_width()
                h_i = stair_floor_1.get_height()
                
                # 接続部屋の位置編集の取得
                x_j = room.get_x()
                y_j = room.get_y()
                w_j = room.get_width()
                h_j = room.get_height()

                # f2_connects_east が True ならば、東側で隣接する
                east_adjacent = model.NewBoolVar()
                model.Add(x_i + w_i == x_j).OnlyEnforceIf(east_adjacent)
                model.Add(y_i + SCALING_FACTOR <= y_j + h_j).OnlyEnforceIf(east_adjacent)
                model.Add(y_j + SCALING_FACTOR <= y_i + h_i).OnlyEnforceIf(east_adjacent)

                # f2_connects_west が True ならば、西側で隣接する
                west_adjacent = model.NewBoolVar()
                model.Add(x_j + w_j == x_i).OnlyEnforceIf(west_adjacent)
                model.Add(y_i + SCALING_FACTOR <= y_j + h_j).OnlyEnforceIf(west_adjacent)
                model.Add(y_j + SCALING_FACTOR <= y_i + h_i).OnlyEnforceIf(west_adjacent)

        # 階段が縦向きの場合
        elif stair_floor_1.height > stair_floor_1.width:

            """
            縦向きの場合は南北で階段が部屋に接続されないといけない
            """

            # 接続する方向を示すブール変数を定義
            f1_connects_north = model.NewBoolVar('f1_connects_north')
            f1_connects_south = model.NewBoolVar('f1_connects_south')
            f2_connects_north = model.NewBoolVar('f2_connects_north')
            f2_connects_south = model.NewBoolVar('f2_connects_south')

            # 階段の接続の論理関係
            model.Add(f1_connects_north + f1_connects_south == 1)
            model.Add(f2_connects_north + f2_connects_south == 1)
            model.AddImplication(f1_connects_north, f2_connects_south)
            model.AddImplication(f1_connects_south, f2_connects_north)

            # 階段1の接続関係が満たされる制約を追加
            for room in room_list_connecting_stairs_1:
                
                # 階段の位置編集の取得
                x_i = stair_floor_1.get_x()
                y_i = stair_floor_1.get_y()
                w_i = stair_floor_1.get_width()
                h_i = stair_floor_1.get_height()
                
                # 接続部屋の位置編集の取得
                x_j = room.get_x()
                y_j = room.get_y()
                w_j = room.get_width()
                h_j = room.get_height()
                
                # f1_connects_north が True ならば、北側で隣接する
                north_adjacent = model.NewBoolVar()
                model.Add(y_i + h_i == y_j).OnlyEnforceIf(north_adjacent)
                model.Add(x_i + SCALING_FACTOR <= x_j + w_j).OnlyEnforceIf(north_adjacent)
                model.Add(x_j + SCALING_FACTOR <= x_i + w_i).OnlyEnforceIf(north_adjacent)

                # f1_connects_south が True ならば、南側で隣接する
                south_adjacent = model.NewBoolVar()
                model.Add(y_j + h_j == y_i).OnlyEnforceIf(south_adjacent)
                model.Add(x_i + SCALING_FACTOR <= x_j + w_j).OnlyEnforceIf(south_adjacent)
                model.Add(x_j + SCALING_FACTOR <= x_i + w_i).OnlyEnforceIf(south_adjacent)

                # f1_connects_northまたはf1_connects_southのいずれかの制約を適用
                model.AddImplication(f1_connects_north, north_adjacent)
                model.AddImplication(f1_connects_south, south_adjacent)

            # 階段2の接続関係が満たされる制約を追加
            for room in room_list_connecting_stairs_2:

                # 階段の位置編集の取得（2階の階段も1階と同じ位置）
                x_i = stair_floor_1.get_x()
                y_i = stair_floor_1.get_y()
                w_i = stair_floor_1.get_width()
                h_i = stair_floor_1.get_height()
                
                # 接続部屋の位置編集の取得
                x_j = room.get_x()
                y_j = room.get_y()
                w_j = room.get_width()
                h_j = room.get_height()

                # f2_connects_north が True ならば、北側で隣接する
                north_adjacent = model.NewBoolVar()
                model.Add(y_i + h_i == y_j).OnlyEnforceIf(north_adjacent)
                model.Add(x_i + SCALING_FACTOR <= x_j + w_j).OnlyEnforceIf(north_adjacent)
                model.Add(x_j + SCALING_FACTOR <= x_i + w_i).OnlyEnforceIf(north_adjacent)

                # f2_connects_south が True ならば、南側で隣接する
                south_adjacent = model.NewBoolVar()
                model.Add(y_j + h_j == y_i).OnlyEnforceIf(south_adjacent)
                model.Add(x_i + SCALING_FACTOR <= x_j + w_j).OnlyEnforceIf(south_adjacent)
                model.Add(x_j + SCALING_FACTOR <= x_i + w_i).OnlyEnforceIf(south_adjacent)

                # f2_connects_northまたはf2_connects_southのいずれかの制約を適用
                model.AddImplication(f2_connects_north, north_adjacent)
                model.AddImplication(f2_connects_south, south_adjacent)

def add_same_size_children_rooms_constraint(room_list, model, room_positions):
    """
    子供部屋1と子供部屋2が同じ大きさになるように制約を追加
    """
    children_room1_idx = None
    children_room2_idx = None
    
    # 子供部屋1と子供部屋2のインデックスを検索
    for i, room in enumerate(room_list):
        if room.name == "子供部屋1":
            children_room1_idx = i
        elif room.name == "子供部屋2":
            children_room2_idx = i
    
    # 両方の子供部屋が存在する場合のみ制約を追加
    if children_room1_idx is not None and children_room2_idx is not None:
        # 幅が同じ
        model.Add(room_positions[children_room1_idx]['w'] == room_positions[children_room2_idx]['w'])
        # 高さが同じ
        model.Add(room_positions[children_room1_idx]['h'] == room_positions[children_room2_idx]['h'])

def add_hallway_connection_constraints(room_list, model, SALING_FACTOR : int) -> None:
    """
    廊下を介して接続してもよい制約を追加
    Args:
        room_list (list): 部屋のリスト
        model (cp_model.CpModel): OR-ToolsのCPモデル
        SALING_FACTOR (int): スケーリングファクター
    Returns:
        None
    """

    # 各部屋ごとに制約条件を追加
    for room in room_list:
        #廊下を介して接続している場合と直接接続している場合のブール変数を定義
        is_directly_connected = model.NewBoolVar(f'is_directly_connected_{room.name}')
        is_connected_via_corridor = model.NewBoolVar(f'is_connected_via_corridor_{room.name}')
        model.AddBoolOr([is_directly_connected, is_connected_via_corridor])

        # 直接接続の制約
        utils.add_direct_connection_constraints(room_list, model, is_directly_connected)

        # 廊下経由接続の制約
        add_corridor_connection_constraints(room_list, model,is_connected_via_corridor)

        def add_direct_connection_constraints(room, model, is_directly_connected):
            pass

        def add_corridor_connection_constraints(room, model, hallway_positions, is_connected_via_corridor):
            pass