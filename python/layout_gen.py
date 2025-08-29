"""
間取り最適化モジュール。

OR-Toolsの制約プログラミング(CP-SAT)ソルバーを用いて、与えられた制約条件を満たす
最適な部屋配置を生成します。主な制約条件には以下が含まれます：
- 部屋の重なり防止
- 接続関係のある部屋同士の隣接
- 特定の部屋（エントランス、階段など）の配置条件
- 部屋間の移動効率の最適化

このモジュールは間取り生成の中核となるロジックを提供します。
"""
import config
from ortools.sat.python import cp_model
import room_definition as room_def
import corridor
import constant
import door_layout as door_layout
import storage_layout

# 小数点第2位までの精度を扱うためのスケーリング係数
# OR-Toolsは整数値のみを扱うため、浮動小数点数値を整数に変換するために使用
SCALING_FACTOR = 4

class LayoutGenerator:
    """
    間取り生成の中核クラス
    
    部屋の論理的な接続関係から物理的な配置を最適化し、実際の間取り図として
    表現できる形に変換します。以下の主要な機能を提供します：
    - 設定ファイルからの部屋情報の読み込み
    - 部屋間の接続関係の構築
    - 制約条件に基づく最適なレイアウトの計算
    - 壁やドアなどの建築要素の配置
    """
    
    def __init__(self):
        """
        LayoutGeneratorのインスタンスを初期化します
        
        部屋タイプのマッピング、土地サイズの設定、部屋オブジェクト格納用の
        リストなどの基本属性を初期化します
        """
        # 部屋名と対応するクラスのマッピング（設定ファイルの名称から適切なクラスを選択するため）
        self.room_class_mapping = {
            "エントランス": room_def.Entrance,
            "玄関収納": room_def.Closet,
            "ホール": room_def.Hallway,
            "リビング": room_def.LivingRoom,
            "ダイニング": room_def.DiningRoom,
            "キッチン": room_def.Kitchen,
            "洗面所": room_def.WashRoom,
            "階段1": room_def.Stairs,
            "トイレ1": room_def.Toilet,
            "浴室": room_def.BathRoom,
            "子供部屋1": room_def.Room,
            "子供部屋2": room_def.Room,
            "寝室": room_def.BedRoom,
            "廊下": room_def.Corridor,
            "副廊下": room_def.Corridor,
            "ウォークインクローゼット": room_def.WalkInCloset,
            "トイレ2": room_def.Toilet,
            "階段2": room_def.Stairs,
            "脱衣室": room_def.WashRoom,
            "収納": room_def.Room,
            "客間": room_def.Room,
            "廊下1": room_def.Corridor,
            "バルコニー": room_def.Room,
        }
        
        # 土地のサイズをユニット単位に変換（内部では浮動小数点で保持）
        self.land_width_units = config.LAND_CONFIG["width"] / config.MODULE_SIZE_MM
        self.land_depth_units = config.LAND_CONFIG["depth"] / config.MODULE_SIZE_MM

        # 部屋オブジェクトのリスト（最適化後に各部屋の座標情報が格納される）
        self.room_list = []
        
        # 部屋間の共有壁情報を格納する辞書
        # {部屋名: {接続先部屋名: {壁タイプ: (x1, y1, x2, y2)}}}
        self.wall_connections = {}

    def load_rooms_from_config(self):
        """
        設定ファイルから部屋情報をロードして部屋オブジェクトを生成します。
        
        config.pyに定義された部屋情報から、対応するクラスのインスタンスを生成し、
        部屋間の接続関係を構築します。
        
        Returns:
            list: 生成された部屋オブジェクトのリスト
            
        Raises:
            KeyError: 設定ファイルに必要な情報が含まれていない場合
        """
        self.room_list = []
        
        # 部屋オブジェクトを作成する処理
        for room_name, room_info in config.ROOM_CONFIG.items():
            # 部屋の幅と奥行きを取得
            width = room_info["width"]
            depth = room_info["depth"]
            floor = room_info["floor"]
            value = room_info["value"]

            # 部屋クラスを取得
            room_class = self.room_class_mapping.get(room_name)
            if room_class:
                # 部屋オブジェクトの生成
                room = room_class(
                    x=0,  # 初期位置はとりあえず原点
                    y=0,  # 初期位置はとりあえず原点
                    width=width,
                    height=depth,
                    floor=floor,
                    value=value,
                    name=room_name,
                    connected_rooms=room_info.get("connections", [])
                )
                self.room_list.append(room)
                print(f"部屋オブジェクト作成: {room_name} ({width}×{depth}ユニット, {floor}階)")
            else:
                print(f"警告: {room_name}に対応するクラスが見つかりません")
        
        # 接続関係を文字列から実際の部屋オブジェクトへの参照に変換
        room_dict = {room.name: room for room in self.room_list}
        for room in self.room_list:
            actual_connected_rooms = []
            for connected_room_name in room.get_connected_rooms():
                if connected_room_name in room_dict:
                    actual_connected_rooms.append(room_dict[connected_room_name])
                else:
                    print(f"警告: 接続先の部屋 '{connected_room_name}' が見つかりません（{room.name}の接続先）")
            room.connected_rooms = actual_connected_rooms
        
        # 接続関係を追加
        for room in self.room_list:
            for connected_room in room.connected_rooms:
                if connected_room not in room.connected_rooms:
                    room.connected_rooms.append(connected_room)
                if room not in connected_room.connected_rooms:
                    connected_room.connected_rooms.append(room)

        return self.room_list

    def get_room_objects(self):
        """
        生成された部屋オブジェクトのリストを返します。
        
        Returns:
            list: 部屋オブジェクトのリスト
        """
        return self.room_list

    def define_room_position_variables(self, model, land_width_scaled, land_depth_scaled):
        """各部屋の位置変数と（廊下の場合は）サイズ変数も定義する"""
        room_positions = {}
        for i, room in enumerate(self.room_list):
            # 廊下の場合は幅・高さも変数化
            if room.name == "廊下":
                min_w = int(1* SCALING_FACTOR)
                max_w = int(land_width_scaled)
                min_h = int(1* SCALING_FACTOR)
                max_h = int(1 * SCALING_FACTOR)
                
                # 変数を先に定義
                x = model.NewIntVar(0, land_width_scaled, f'x_{i}_{room.name}')
                y = model.NewIntVar(0, land_depth_scaled, f'y_{i}_{room.name}')
                w = model.NewIntVar(min_w, max_w, f'w_{i}_{room.name}')
                h = model.NewIntVar(min_h, max_h, f'h_{i}_{room.name}')
                
                # 敷地内に収まるための明示的な制約を追加
                model.Add(x + w <= land_width_scaled)
                model.Add(y + h <= land_depth_scaled)
                
                room_positions[i] = {'x': x, 'y': y, 'w': w, 'h': h}

            elif room.name == "副廊下":
                min_w = 0
                max_w = int(land_width_scaled/2)
                min_h = 0
                max_h = int(land_depth_scaled/2)
                
                # 変数を先に定義
                x = model.NewIntVar(0, land_width_scaled, f'x_{i}_{room.name}')
                y = model.NewIntVar(0, land_depth_scaled, f'y_{i}_{room.name}')
                w = model.NewIntVar(min_w, max_w, f'w_{i}_{room.name}')
                h = model.NewIntVar(min_h, max_h, f'h_{i}_{room.name}')
                
                # 敷地内に収まるための明示的な制約を追加
                model.Add(x + w <= land_width_scaled)
                model.Add(y + h <= land_depth_scaled)
                
                room_positions[i] = {'x': x, 'y': y, 'w': w, 'h': h}

            elif room.name in ["子供部屋1","子供部屋2","寝室"]:
                min_w = int(2* SCALING_FACTOR)
                max_w = int(land_width_scaled/2)
                min_h = int(2* SCALING_FACTOR)
                max_h = int(land_depth_scaled/2)

                # 面積の制約を定義
                min_area = 4  # 最小面積
                max_area = int(land_width_scaled * land_depth_scaled / 7)  # 最大面積

                # 変数を先に定義
                x = model.NewIntVar(0, land_width_scaled, f'x_{i}_{room.name}')
                y = model.NewIntVar(0, land_depth_scaled, f'y_{i}_{room.name}')
                w = model.NewIntVar(min_w, max_w, f'w_{i}_{room.name}')
                h = model.NewIntVar(min_h, max_h, f'h_{i}_{room.name}')
                area = model.NewIntVar(min_area, max_area, f'area_{i}_{room.name}')
                
                # 面積制約: area = w * h
                model.AddMultiplicationEquality(area, [w, h])
                
                # 敷地内に収まるための明示的な制約を追加
                model.Add(x + w <= land_width_scaled)
                model.Add(y + h <= land_depth_scaled)
                
                room_positions[i] = {'x': x, 'y': y, 'w': w, 'h': h, 'area': area}
            else:
                room_width_scaled = int(room.width * SCALING_FACTOR)
                room_height_scaled = int(room.height * SCALING_FACTOR)
                max_x = land_width_scaled - room_width_scaled
                max_y = land_depth_scaled - room_height_scaled
                if max_x < 0: max_x = 0
                if max_y < 0: max_y = 0
                room_positions[i] = {
                    'x': model.NewIntVar(0, max_x, f'x_{i}_{room.name}'),
                    'y': model.NewIntVar(0, max_y, f'y_{i}_{room.name}'),
                    'w': room_width_scaled,
                    'h': room_height_scaled
                }
        return room_positions

    def process_solver_results(self, solver, room_positions, status):
        """ソルバーの結果を処理する"""
        if status == cp_model.OPTIMAL:
            print("最適解が見つかりました！")
            
            # 副廊下が存在するかどうか確認するフラグ
            sub_corridor_exists = False
            sub_corridor_idx = None
            
            # 各部屋の座標をソルバーの結果で更新
            for i, room in enumerate(self.room_list):
                room.x = solver.Value(room_positions[i]['x']) / SCALING_FACTOR
                room.y = solver.Value(room_positions[i]['y']) / SCALING_FACTOR
                room.width = solver.Value(room_positions[i]['w']) / SCALING_FACTOR
                room.height = solver.Value(room_positions[i]['h']) / SCALING_FACTOR
                
                # 副廊下のインデックスとサイズを確認
                if room.name == "副廊下":
                    sub_corridor_idx = i
                    if room.width > 0 and room.height > 0:
                        sub_corridor_exists = True
                
                # 既存のドア・収納情報があれば初期化（再配置のため）
                room.doors = []
                room.storages = []
            
            # 副廊下が存在しない場合、削除
            if not sub_corridor_exists and sub_corridor_idx is not None:
                print("副廊下は使用されていないため、削除します。")
                removed_corridor = self.room_list.pop(sub_corridor_idx)
                
                # 接続関係のあった部屋から副廊下への参照を削除
                for room in self.room_list:
                    if removed_corridor in room.connected_rooms:
                        room.connected_rooms.remove(removed_corridor)
            
            # 壁情報を計算し、ドアを配置
            door_layout.place_doors(self.room_list)
            
            # 収納を配置（config.pyの設定のみ）
            storage_layout.set_storage_layout(self.room_list)
            
            return True
            
        elif status == cp_model.FEASIBLE:
            print("実行可能解は見つかりましたが、最適性は保証されていません。")
            return False
        else:
            print("解が見つかりませんでした。制約条件を見直してください。")
            return False
    
    def place_doors(self):
        """部屋間のドアを配置する"""
        wall_connections = {}
        for room in self.room_list:
            # 各部屋と接続部屋との共有壁情報を取得
            current_room_connections = room.get_wall_between_connected_rooms()
            wall_connections[room.name] = current_room_connections
            
            # 接続壁情報のログ出力と共有壁へのドア配置
            print(f"{room.name}の接続壁情報:")
            if current_room_connections:
                for connected_room_name, walls_dict in current_room_connections.items():
                    print(f"  - {connected_room_name}との接続壁:")
                    if walls_dict:
                        # 共有壁ごとにドアを追加
                        for wall_type, coords in walls_dict.items():
                            print(f"    * {wall_type}: {coords}")
                            # 壁の方向を特定し、壁の左端/下端にドアを配置
                            wall_direction = wall_type.split('_')[0]  # "north_common_wall" -> "north"
                            room.add_door(wall_side=wall_direction, position_ratio=0.0)
                    else:
                        print(f"    * （壁情報詳細なし）") 
            
            # 接続関係はあるが共有壁が見つからなかった部屋の記録
            for connected_room_obj in room.connected_rooms:
                if not current_room_connections or connected_room_obj.name not in current_room_connections:
                    print(f"  - {connected_room_obj.name}との接続壁（情報なし）")

        # 壁接続情報を保存
        self.wall_connections = wall_connections
        
        # 配置したドア情報のログ出力
        print("\n各部屋のドア情報:")
        for room in self.room_list:
            print(f"{room.name}のドア ({len(room.doors)}個):")
            for door in room.doors:
                print(f"  - {door}")

    def print_room_positions(self):
        print("\n=== 部屋の位置とサイズ ===")
        print(f"{'部屋名':<15} {'階':^5} {'X座標':^10} {'Y座標':^10} {'幅':^10} {'高さ':^10}")
        print("-" * 65)
    
        # 階ごとに整理して出力
        for floor in [1, 2]:
            floor_rooms = [room for room in self.room_list if room.floor == floor]
            if floor_rooms:
                print(f"\n【{floor}階】")
                for room in floor_rooms:
                    print(f"{room.name:<15} {room.floor:^5} {room.x:^10.2f} {room.y:^10.2f} {room.width:^10.2f} {room.height:^10.2f}")
# --- optimize_layout内で呼び出しを追加 ---
    def optimize_layout(self):
        """OR-Toolsを使用して最適なレイアウトを計算します。"""
        if not self.room_list:
            raise ValueError("部屋オブジェクトが生成されていません。先にload_rooms_from_configを実行してください。")
        
        model = cp_model.CpModel()
        
        # 土地の寸法をスケーリング（整数変数で扱うため）
        land_width_scaled = int(self.land_width_units * SCALING_FACTOR)
        land_depth_scaled = int(self.land_depth_units * SCALING_FACTOR)
        
        # 各部屋の位置変数を定義
        room_positions = self.define_room_position_variables(model, land_width_scaled, land_depth_scaled)
        
        # 制約1: 部屋が重ならないようにする
        constant.add_non_overlap_constraints(self.room_list, model, room_positions)
        
        #制約2: 接続関係にある部屋は隣接している必要がある
        #constant.add_adjacency_constraints(self.room_list, model, room_positions, config, SCALING_FACTOR)

        # 制約2-2: 接続関係を持つ部屋は直接または廊下を介して隣接している必要がある
        corridor.add_connected_rooms_adjacency_constraint(self.room_list, model, room_positions, SCALING_FACTOR)

        # 制約3: 廊下の持っている隣接オブジェクトは必ず隣接または重なり合う
        #corridor.add_corridor_adjacency_or_overlap_constraints(self.room_list, model, room_positions, SCALING_FACTOR)
            
        # 制約3-2: 廊下の持っているオブジェクトは廊下か副廊下と隣接している
        #corridor.add_corridor_connected_rooms_adjacency_constraints(self.room_list, model, room_positions, SCALING_FACTOR)
        
        # 制約4: 接続部屋間の距離を最小化
        adj_distance_vars = constant.add_distance_minimization(self.room_list, model, room_positions, land_width_scaled, land_depth_scaled, config)
        
        # 制約5: 階段の位置を一致させる
        constant.add_stairs_alignment_constraints(self.room_list, model, room_positions)
        
        # 制約6: エントランスは外周に接する
        constant.add_entrance_edge_constraints(self.room_list, model, room_positions, land_width_scaled, land_depth_scaled, SCALING_FACTOR)

        #廊下が階段の北につく(暫定的)
        #corridor.add_corridor_stairs_alignment_constraint(self.room_list, model, room_positions, SCALING_FACTOR)
    
    
        # #廊下と副廊下が隣接する制約
        corridor.add_corridor_adjacency_constraints(self.room_list, model, room_positions, SCALING_FACTOR)

        #2階のすべての部屋が壁に接する
        #constant.add_second_floor_edge_constraints(self.room_list, model, room_positions, land_width_scaled, land_depth_scaled)

        #副廊下の存在ペナルティ
        subsidiary_corridor_exists = corridor.add_optional_corridor_constraint(self.room_list, model, room_positions, SCALING_FACTOR)

        area_data = constant.add_second_floor_area_maximization(self.room_list, model, room_positions, land_width_scaled, land_depth_scaled)

        # リビングを南側にする制約を追加
        constant.add_specific_room_south_constraint(self.room_list, model, room_positions, "リビング")

        # ドアと接続先の部屋が適切に配置される制約
        constant.add_constrain_door_to_stair_access(self.room_list, model,SCALING_FACTOR)

        # 子供部屋1と子供部屋2が同じ大きさになるように制約を追加
        constant.add_same_size_children_rooms_constraint(self.room_list, model, room_positions)

        # 廊下の面積を計算
        corridor_h = None
        subsidiary_corridor_w = None
        for i, room in enumerate(self.room_list):
            if room.name == "廊下":
                corridor_h = room_positions[i]['h']
            elif room.name == "副廊下":
                subsidiary_corridor_w = room_positions[i]['w']
        
        # 目的関数の設定（最小化）
        objective_terms = []
        if adj_distance_vars:
            objective_terms.extend(adj_distance_vars)
        if corridor_h is not None:
            objective_terms.append(corridor_h)
        if subsidiary_corridor_exists is not None:
            objective_terms.append(10000 * subsidiary_corridor_exists)
        if area_data is not None:
            objective_terms.append(-100 * area_data)  # 面積を最大化するために負の値
        
        if objective_terms:
            model.Minimize(sum(objective_terms))
        
        # ソルバーの実行
        solver = cp_model.CpSolver()
        status = solver.Solve(model)

        # ステータスと目的関数値を表示
        print(f"Solver status: {solver.StatusName(status)}")
        if objective_terms:
            print(f"Objective value: {solver.ObjectiveValue()}")
        result = self.process_solver_results(solver, room_positions, status)
        if result:
            self.print_room_positions()
        return result

    def generate_layout(self):
        """
        部屋のロードと最適化を一括で行います。
        
        Returns:
            bool: 最適化が成功した場合はTrue、失敗した場合はFalse
        """
        self.load_rooms_from_config()
        return self.optimize_layout()