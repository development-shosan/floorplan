from app.logic import utils

def add_corridor_adjacency_or_overlap_constraints(room_list, model, room_positions, SCALING_FACTOR):
    """
    廊下の持っている隣接オブジェクトは必ず隣接または重なり合う制約を追加
    """
    for i, room in enumerate(room_list):
        if room.name != "廊下":
            continue
        corridor_idx = i
        corridor = room
        for adj_room in corridor.connected_rooms:
            # 階が異なる場合はスキップ
            if adj_room.floor != corridor.floor:
                continue
            adj_idx = room_list.index(adj_room)
            utils._add_adjacency_for_room_pair(model, room_positions, adj_idx, corridor_idx, SCALING_FACTOR)

def add_corridor_adjacency_constraints(room_list, model, room_positions, SCALING_FACTOR):
    """
    廊下と副廊下が隣接するように制約を追加
    """
    corridor_idx = None
    sub_corridor_idx = None

    # 廊下と副廊下のインデックスを最初に取得
    for i, room in enumerate(room_list):
        if room.name == "廊下":
            corridor_idx = i
        elif room.name == "副廊下":
            sub_corridor_idx = i

    # 廊下と副廊下が両方存在する場合、隣接制約を追加
    if corridor_idx is not None and sub_corridor_idx is not None:
        utils._add_adjacency_for_room_pair(model, room_positions, corridor_idx, sub_corridor_idx, SCALING_FACTOR)

def add_corridor_stairs_alignment_constraint(room_list, model, room_positions, SCALING_FACTOR):
    """
    廊下は必ず階段の上辺（北側）に接する制約を追加
    """
    # 廊下と階段（同じ階）のインデックスを取得
    for i, room in enumerate(room_list):
        if room.name == "廊下":
            corridor_idx = i
            corridor_floor = room.floor
            break
    else:
        return  # 廊下がなければ何もしない

    stairs_idx = None
    for i, room in enumerate(room_list):
        if "階段" in room.name and room.floor == corridor_floor:
            stairs_idx = i
            break
    if stairs_idx is None:
        return  # 同じ階の階段がなければ何もしない

    # 変数取得
    x_corr = room_positions[corridor_idx]['x']
    y_corr = room_positions[corridor_idx]['y']
    w_corr = room_positions[corridor_idx]['w']
    h_corr = room_positions[corridor_idx]['h']
    x_st = room_positions[stairs_idx]['x']
    y_st = room_positions[stairs_idx]['y']
    w_st = room_positions[stairs_idx]['w']
    h_st = room_positions[stairs_idx]['h']

    # 廊下の下端が階段の上端と一致し、x方向で1マス以上重なる
    model.Add(y_corr == y_st + h_st)
    x_overlap = model.NewIntVar(0, 10000, f'corridor_stairs_x_overlap_{corridor_idx}_{stairs_idx}')
    x_corr_end = model.NewIntVar(0, 10000, f'x_corr_end_{corridor_idx}')
    x_st_end = model.NewIntVar(0, 10000, f'x_st_end_{stairs_idx}')
    model.Add(x_corr_end == x_corr + w_corr)
    model.Add(x_st_end == x_st + w_st)
    x_left = model.NewIntVar(0, 10000, f'x_left_{corridor_idx}_{stairs_idx}')
    x_right = model.NewIntVar(0, 10000, f'x_right_{corridor_idx}_{stairs_idx}')
    model.AddMaxEquality(x_left, [x_corr, x_st])
    model.AddMinEquality(x_right, [x_corr_end, x_st_end])
    model.Add(x_overlap == x_right - x_left)
    model.Add(x_overlap >= int(1 * SCALING_FACTOR))  

def add_optional_corridor_constraint(room_list, model, room_positions, SCALING_FACTOR):
    """
    副廊下は必要に応じて省略可能にする制約を追加
    """
    # 副廊下のインデックスを取得
    subsidiary_corridor_idx = None
    for i, room in enumerate(room_list):
        if room.name == "副廊下":
            subsidiary_corridor_idx = i
            break
        
    if subsidiary_corridor_idx is None:
        return None  # 副廊下が定義されていない場合は何もしない
        
    # 副廊下の存在を表す変数
    corridor_exists = model.NewBoolVar('subsidiary_corridor_exists')
        
    # 変数の取得
    x = room_positions[subsidiary_corridor_idx]['x']
    y = room_positions[subsidiary_corridor_idx]['y']
    w = room_positions[subsidiary_corridor_idx]['w']
    h = room_positions[subsidiary_corridor_idx]['h']
    
    # 存在しない場合、サイズを0に設定
    model.Add(w == 0).OnlyEnforceIf(corridor_exists.Not())
    model.Add(h == 0).OnlyEnforceIf(corridor_exists.Not())
    
    # 存在する場合、最小サイズ以上
    min_size = int(1 * SCALING_FACTOR)  # 最小サイズ（1ユニット）
    model.Add(w >= min_size).OnlyEnforceIf(corridor_exists)
    model.Add(h >= min_size).OnlyEnforceIf(corridor_exists)
    
    # 存在しない場合は接続関係も無効にする必要がある
    # （実装省略 - より複雑な制約が必要）
    
    return corridor_exists  # 存在変数を返して目的関数で使用可能に

def add_corridor_connected_rooms_adjacency_constraints(room_list, model, room_positions, SCALING_FACTOR):
    """
    廊下の持っているオブジェクト（接続された部屋）は廊下か副廊下と隣接している制約を追加
    """
    # 廊下のインデックスを取得
    corridor_indices = []
    for i, room in enumerate(room_list):
        if room.name == "廊下" or room.name == "副廊下":
            corridor_indices.append(i)
    
    if not corridor_indices:
        return  # 廊下が存在しない場合は何もしない
    
    # 廊下と接続されたすべての部屋を取得
    corridor_connected_rooms = set()
    for i, room in enumerate(room_list):
        if room.name == "廊下":
            for connected_room in room.connected_rooms:
                # 廊下や副廊下以外の部屋のみ対象
                if connected_room.name != "廊下" and connected_room.name != "副廊下":
                    connected_room_idx = room_list.index(connected_room)
                    corridor_connected_rooms.add(connected_room_idx)
    
    # 各接続された部屋が少なくとも一つの廊下（または副廊下）と隣接している制約
    for room_idx in corridor_connected_rooms:
        room = room_list[room_idx]
        
        # この部屋が少なくとも一つの廊下と隣接している必要がある
        adjacency_vars = []
        
        for corridor_idx in corridor_indices:
            corridor_room = room_list[corridor_idx]
            
            # 同じ階の廊下のみ対象
            if room.floor != corridor_room.floor:
                continue
            
            # この部屋と廊下が隣接しているかのブール変数
            adjacent_var = model.NewBoolVar(f'room_{room_idx}_adjacent_to_corridor_{corridor_idx}')
            adjacency_vars.append(adjacent_var)
            
            # 隣接制約を定義
            _add_conditional_adjacency_constraint(model, room_positions, room_idx, corridor_idx, adjacent_var, SCALING_FACTOR)
        
        # 少なくとも一つの廊下と隣接している必要がある
        if adjacency_vars:
            model.AddBoolOr(adjacency_vars)

def _add_conditional_adjacency_constraint(model, room_positions, i, j, adjacent_var, SCALING_FACTOR):
    """
    条件付き隣接制約：adjacent_varがTrueの場合のみ、部屋iと部屋jが隣接している
    """
    x_i = room_positions[i]['x']
    y_i = room_positions[i]['y']
    w_i = room_positions[i]['w']
    h_i = room_positions[i]['h']
    x_j = room_positions[j]['x']
    y_j = room_positions[j]['y']
    w_j = room_positions[j]['w']
    h_j = room_positions[j]['h']

    # 左右で隣接（y方向で1マス以上重なり、x端が一致）
    left_adjacent = model.NewBoolVar(f'conditional_left_adjacent_{i}_{j}')
    model.Add(x_i + w_i == x_j).OnlyEnforceIf([left_adjacent, adjacent_var])
    model.Add(y_i + SCALING_FACTOR <= y_j + h_j).OnlyEnforceIf([left_adjacent, adjacent_var])
    model.Add(y_j + SCALING_FACTOR <= y_i + h_i).OnlyEnforceIf([left_adjacent, adjacent_var])

    right_adjacent = model.NewBoolVar(f'conditional_right_adjacent_{i}_{j}')
    model.Add(x_j + w_j == x_i).OnlyEnforceIf([right_adjacent, adjacent_var])
    model.Add(y_i + SCALING_FACTOR <= y_j + h_j).OnlyEnforceIf([right_adjacent, adjacent_var])
    model.Add(y_j + SCALING_FACTOR <= y_i + h_i).OnlyEnforceIf([right_adjacent, adjacent_var])

    # 上下で隣接（x方向で1マス以上重なり、y端が一致）
    below_adjacent = model.NewBoolVar(f'conditional_below_adjacent_{i}_{j}')
    model.Add(y_i + h_i == y_j).OnlyEnforceIf([below_adjacent, adjacent_var])
    model.Add(x_i + SCALING_FACTOR <= x_j + w_j).OnlyEnforceIf([below_adjacent, adjacent_var])
    model.Add(x_j + SCALING_FACTOR <= x_i + w_i).OnlyEnforceIf([below_adjacent, adjacent_var])

    above_adjacent = model.NewBoolVar(f'conditional_above_adjacent_{i}_{j}')
    model.Add(y_j + h_j == y_i).OnlyEnforceIf([above_adjacent, adjacent_var])
    model.Add(x_i + SCALING_FACTOR <= x_j + w_j).OnlyEnforceIf([above_adjacent, adjacent_var])
    model.Add(x_j + SCALING_FACTOR <= x_i + w_i).OnlyEnforceIf([above_adjacent, adjacent_var])

    # adjacent_varがTrueの場合、いずれかの辺で隣接していればOK
    model.AddBoolOr([left_adjacent, right_adjacent, below_adjacent, above_adjacent]).OnlyEnforceIf(adjacent_var)

def add_connected_rooms_adjacency_constraint(room_list, model, room_positions, SCALING_FACTOR):
    """
    接続関係を持つ二つの部屋は隣接しあう制約を追加
    隣接とは：
    1. 直接接している
    2. 両方の部屋が同じ廊下（名前に"廊下"を含む部屋）と接している
    """
    # 廊下のインデックスを取得
    corridor_indices = []
    for i, room in enumerate(room_list):
        if "廊下" in room.name:
            corridor_indices.append(i)
    
    # 接続関係を持つ部屋ペアを処理
    for i, room_i in enumerate(room_list):
        if "廊下" in room_i.name:
            continue  # 廊下は対象外
            
        for j, room_j in enumerate(room_list):
            if j <= i or "廊下" in room_j.name:
                continue  # 同じ部屋、すでに処理済み、または廊下は対象外
            
            # 接続関係があるかチェック
            if room_j not in room_i.connected_rooms:
                continue
            
            # 同じ階の部屋のみ対象
            if room_i.floor != room_j.floor:
                continue
            
            # 二つの部屋が隣接している（直接または廊下を介して）制約を追加
            _add_room_pair_adjacency_constraint(model, room_positions, i, j, corridor_indices, SCALING_FACTOR)

def _add_room_pair_adjacency_constraint(model, room_positions, i, j, corridor_indices, SCALING_FACTOR):
    """
    二つの部屋が隣接している制約を追加
    隣接方法：
    1. 直接隣接
    2. 同じ廊下と接している
    """
    # 直接隣接しているかのブール変数
    directly_adjacent = model.NewBoolVar(f'directly_adjacent_{i}_{j}')
    
    # 直接隣接制約
    _add_conditional_direct_adjacency(model, room_positions, i, j, directly_adjacent, SCALING_FACTOR)
    
    # 同じ廊下を介して接続されているかのブール変数リスト
    corridor_connection_vars = []
    
    for corridor_idx in corridor_indices:
        # 両方の部屋が同じ廊下と隣接しているかのブール変数
        both_adjacent_to_corridor = model.NewBoolVar(f'both_adjacent_to_corridor_{i}_{j}_{corridor_idx}')
        corridor_connection_vars.append(both_adjacent_to_corridor)
        
        # 部屋iが廊下と隣接
        room_i_adjacent = model.NewBoolVar(f'room_{i}_adjacent_to_corridor_{corridor_idx}')
        _add_conditional_adjacency_constraint(model, room_positions, i, corridor_idx, room_i_adjacent, SCALING_FACTOR)
        
        # 部屋jが廊下と隣接
        room_j_adjacent = model.NewBoolVar(f'room_{j}_adjacent_to_corridor_{corridor_idx}')
        _add_conditional_adjacency_constraint(model, room_positions, j, corridor_idx, room_j_adjacent, SCALING_FACTOR)
        
        # 両方が廊下と隣接している場合のみboth_adjacent_to_corridorがTrue
        model.AddBoolAnd([room_i_adjacent, room_j_adjacent]).OnlyEnforceIf(both_adjacent_to_corridor)
        model.AddBoolOr([room_i_adjacent.Not(), room_j_adjacent.Not()]).OnlyEnforceIf(both_adjacent_to_corridor.Not())
    
    # 直接隣接または少なくとも一つの廊下を介して接続されている必要がある
    adjacency_options = [directly_adjacent] + corridor_connection_vars
    model.AddBoolOr(adjacency_options)

def _add_conditional_direct_adjacency(model, room_positions, i, j, adjacent_var, SCALING_FACTOR):
    """
    条件付き直接隣接制約：adjacent_varがTrueの場合のみ、部屋iと部屋jが直接隣接している
    """
    x_i = room_positions[i]['x']
    y_i = room_positions[i]['y']
    w_i = room_positions[i]['w']
    h_i = room_positions[i]['h']
    x_j = room_positions[j]['x']
    y_j = room_positions[j]['y']
    w_j = room_positions[j]['w']
    h_j = room_positions[j]['h']

    # 左右で隣接（y方向で1マス以上重なり、x端が一致）
    left_adjacent = model.NewBoolVar(f'direct_left_adjacent_{i}_{j}')
    model.Add(x_i + w_i == x_j).OnlyEnforceIf([left_adjacent, adjacent_var])
    model.Add(y_i + SCALING_FACTOR <= y_j + h_j).OnlyEnforceIf([left_adjacent, adjacent_var])
    model.Add(y_j + SCALING_FACTOR <= y_i + h_i).OnlyEnforceIf([left_adjacent, adjacent_var])

    right_adjacent = model.NewBoolVar(f'direct_right_adjacent_{i}_{j}')
    model.Add(x_j + w_j == x_i).OnlyEnforceIf([right_adjacent, adjacent_var])
    model.Add(y_i + SCALING_FACTOR <= y_j + h_j).OnlyEnforceIf([right_adjacent, adjacent_var])
    model.Add(y_j + SCALING_FACTOR <= y_i + h_i).OnlyEnforceIf([right_adjacent, adjacent_var])

    # 上下で隣接（x方向で1マス以上重なり、y端が一致）
    below_adjacent = model.NewBoolVar(f'direct_below_adjacent_{i}_{j}')
    model.Add(y_i + h_i == y_j).OnlyEnforceIf([below_adjacent, adjacent_var])
    model.Add(x_i + SCALING_FACTOR <= x_j + w_j).OnlyEnforceIf([below_adjacent, adjacent_var])
    model.Add(x_j + SCALING_FACTOR <= x_i + w_i).OnlyEnforceIf([below_adjacent, adjacent_var])

    above_adjacent = model.NewBoolVar(f'direct_above_adjacent_{i}_{j}')
    model.Add(y_j + h_j == y_i).OnlyEnforceIf([above_adjacent, adjacent_var])
    model.Add(x_i + SCALING_FACTOR <= x_j + w_j).OnlyEnforceIf([above_adjacent, adjacent_var])
    model.Add(x_j + SCALING_FACTOR <= x_i + w_i).OnlyEnforceIf([above_adjacent, adjacent_var])

    # adjacent_varがTrueの場合、いずれかの辺で隣接していればOK
    model.AddBoolOr([left_adjacent, right_adjacent, below_adjacent, above_adjacent]).OnlyEnforceIf(adjacent_var)
