"""
ドア配置モジュール。

間取り最適化後の部屋配置に基づいて、部屋間のドアを自動配置する機能を提供します。
部屋間の共有壁を検出し、適切な位置にドアオブジェクトを生成・配置します。
"""
from app.logic import room_definition as rd

def get_opposite_direction(direction):
    """与えられた方向の反対方向を返す"""
    opposites = {'north': 'south', 'south': 'north', 'east': 'west', 'west': 'east'}
    return opposites[direction]

def place_doors(room_list):
    """部屋間のドアを配置する"""
    processed_connections = set()
    
    for room in room_list:
        try:
            # 各部屋と接続部屋との共有壁情報を取得
            current_room_connections = room.get_wall_between_connected_rooms()
            
            print(f"{room.name}の接続壁情報:")
            if current_room_connections:
                # 部屋オブジェクトをキーとして使用
                for connected_room_obj, walls_dict in current_room_connections.items():
                    # 接続がすでに処理済みかチェック
                    connection_key = tuple(sorted([room.name, connected_room_obj.name]))
                    if connection_key in processed_connections:
                        continue
                    
                    processed_connections.add(connection_key)
                    print(f"  - {connected_room_obj.name}との接続壁:")
                    
                    if walls_dict:
                        # 共有壁ごとにドアを追加
                        for wall_type, coords in walls_dict.items():
                            x1, y1, x2, y2 = coords
                            print(f"    * {wall_type}: {coords}")
                            
                            # 共有壁の中央位置を計算
                            if wall_type in ["north", "south"]:
                                # 水平な壁の場合
                                door_x = (x1 + x2) / 2 - 0.5  # ドア幅の半分を左に
                                door_width = 1.0
                                
                                # 部屋の壁全体に対する相対位置を計算
                                room1_position_ratio = (door_x - room.x) / room.width
                                room2_position_ratio = (door_x - connected_room_obj.x) / connected_room_obj.width
                                
                            else:  # "east", "west"
                                # 垂直な壁の場合
                                door_y = (y1 + y2) / 2 - 0.5  # ドア幅の半分を下に
                                door_width = 1.0
                                
                                # 部屋の壁全体に対する相対位置を計算
                                room1_position_ratio = (door_y - room.y) / room.height
                                room2_position_ratio = (door_y - connected_room_obj.y) / connected_room_obj.height
                            
                            # 両方の部屋にドアを追加（共有壁の中央位置を基準に）
                            opposite_direction = get_opposite_direction(wall_type)
                            
                            door1 = room.add_door(
                                wall_side=wall_type, 
                                position_ratio=room1_position_ratio,
                                width_units=door_width
                            )
                            
                            door2 = connected_room_obj.add_door(
                                wall_side=opposite_direction, 
                                position_ratio=room2_position_ratio,
                                width_units=door_width
                            )
                            
                            # ドア情報を表示
                            print(f"    * {room.name}にドアを追加: {door1}")
                            print(f"    * {connected_room_obj.name}にドアを追加: {door2}")
                            
                            # ドア座標が一致しているか確認
                            door1_coords = door1.get_absolute_coordinates()
                            door2_coords = door2.get_absolute_coordinates()
                            print(f"    * ドア1座標: {door1_coords}")
                            print(f"    * ドア2座標: {door2_coords}")
                            
        except Exception as e:
            print(f"Error processing room {room.name}: {e}")
