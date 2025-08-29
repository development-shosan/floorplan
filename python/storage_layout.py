import config

def set_storage_layout(room_list):
    """
    config.pyで定義された収納設定を部屋に適用し、干渉チェックも行います
    
    Args:
        room_list (list): 部屋オブジェクトのリスト
    """
    
    for room in room_list:
        # config.pyから部屋の設定を取得
        room_config = config.ROOM_CONFIG.get(room.name, {})
        storage_configs = room_config.get("storage", [])
        
        # 各収納設定を適用
        for storage_config in storage_configs:
            # 収納の基本情報を取得
            wall_side = storage_config.get("wall_side", "none")
            width = storage_config.get("width", 1.0)
            height = storage_config.get("height", 1.0)
            name = storage_config.get("name", "収納")
            
            # 干渉チェックを実行
            if is_storage_placement_valid(room, wall_side, width, height):
                # 干渉がない場合のみ収納を配置
                room.add_storage(
                    wall_side=wall_side,
                    width=width,
                    height=height,
                    name=name
                )
                print(f"{room.name}に設定収納を配置しました: {name}")
            else:
                # 干渉がある場合は代替位置を探す
                alternative_position = find_alternative_storage_position(room, width, height, name)
                if alternative_position:
                    room.add_storage(
                        wall_side=alternative_position["wall_side"],
                        width=width,
                        height=height,
                        name=name
                    )
                    print(f"{room.name}に設定収納を代替位置に配置しました: {name} ({alternative_position['wall_side']})")
                else:
                    print(f"警告: {room.name}の{name}は干渉のため配置できませんでした")


def is_storage_placement_valid(room, wall_side, storage_width, storage_height):
    """
    収納配置が有効かどうかをチェックします（ドアや接続壁との干渉を確認）
    
    Args:
        room (Room): 部屋オブジェクト
        wall_side (str): 収納を配置する壁またはコーナー
        storage_width (float): 収納の幅
        storage_height (float): 収納の高さ
    
    Returns:
        bool: 配置が有効な場合True
    """
    
    # 仮の収納オブジェクトを作成して座標を取得
    temp_storage = type('TempStorage', (), {
        'parent_room': room,
        'wall_side': wall_side,
        'width': storage_width,
        'height': storage_height,
        'position_ratio': 0.0,
        'is_corner': wall_side in ["northwest", "northeast", "southwest", "southeast"],
        'is_wall_aligned': wall_side in ["north", "south", "east", "west"]
    })()
    
    # 収納の絶対座標を取得
    storage_x, storage_y, storage_w, storage_h = get_storage_absolute_coordinates(temp_storage)
    
    # 1. ドアとの干渉チェック
    for door in room.doors:
        if check_storage_door_interference(storage_x, storage_y, storage_w, storage_h, door):
            return False
    
    # 2. 接続壁との干渉チェック
    if check_storage_connection_wall_interference(room, wall_side, storage_x, storage_y, storage_w, storage_h):
        return False
    
    # 3. 部屋境界チェック
    if not check_storage_within_room_bounds(room, storage_x, storage_y, storage_w, storage_h):
        return False
    
    return True


def get_storage_absolute_coordinates(storage):
    """
    収納の絶対座標を計算します（room_definition.pyのStorage.get_absolute_coordinatesと同様）
    
    Args:
        storage: 収納オブジェクト（または仮オブジェクト）
    
    Returns:
        tuple: (x, y, width, height) 収納の座標とサイズ
    """
    room_x = storage.parent_room.x
    room_y = storage.parent_room.y
    room_width = storage.parent_room.width
    room_height = storage.parent_room.height
    
    # コーナーに配置する場合
    if storage.is_corner:
        if storage.wall_side == "northwest":  # 左上
            x = room_x
            y = room_y + room_height - storage.height
        elif storage.wall_side == "northeast":  # 右上
            x = room_x + room_width - storage.width
            y = room_y + room_height - storage.height
        elif storage.wall_side == "southwest":  # 左下
            x = room_x
            y = room_y
        elif storage.wall_side == "southeast":  # 右下
            x = room_x + room_width - storage.width
            y = room_y
        else:
            x = room_x
            y = room_y
    # 壁沿いに配置する場合
    elif storage.is_wall_aligned:
        if storage.wall_side == "north":  # 北側の壁
            x = room_x + (room_width - storage.width) * storage.position_ratio
            y = room_y + room_height - storage.height
        elif storage.wall_side == "south":  # 南側の壁
            x = room_x + (room_width - storage.width) * storage.position_ratio
            y = room_y
        elif storage.wall_side == "east":  # 東側の壁
            x = room_x + room_width - storage.width
            y = room_y + (room_height - storage.height) * storage.position_ratio
        elif storage.wall_side == "west":  # 西側の壁
            x = room_x
            y = room_y + (room_height - storage.height) * storage.position_ratio
        else:
            x = room_x
            y = room_y
    else:
        # 自由配置の場合
        x = room_x
        y = room_y
    
    return x, y, storage.width, storage.height


def check_storage_door_interference(storage_x, storage_y, storage_w, storage_h, door):
    """
    収納とドアの干渉をチェックします
    
    Args:
        storage_x, storage_y, storage_w, storage_h: 収納の座標とサイズ
        door: ドアオブジェクト
    
    Returns:
        bool: 干渉がある場合True
    """
    door_x1, door_y1, door_x2, door_y2 = door.get_absolute_coordinates()
    
    # ドアの占有範囲を計算（ドアの前後に0.5ユニットずつ余裕を持たせる）
    door_margin = 0.5
    
    if door.wall_side == "north":
        door_area = (door_x1 - door_margin, door_y1 - door_margin, 
                    door_x2 + door_margin, door_y1 + door_margin)
    elif door.wall_side == "south":
        door_area = (door_x1 - door_margin, door_y1 - door_margin,
                    door_x2 + door_margin, door_y1 + door_margin)
    elif door.wall_side == "east":
        door_area = (door_x1 - door_margin, door_y1 - door_margin,
                    door_x1 + door_margin, door_y2 + door_margin)
    elif door.wall_side == "west":
        door_area = (door_x1 - door_margin, door_y1 - door_margin,
                    door_x1 + door_margin, door_y2 + door_margin)
    else:
        return False
    
    # 収納の占有範囲
    storage_area = (storage_x, storage_y, storage_x + storage_w, storage_y + storage_h)
    
    # 重複チェック
    return rectangles_overlap(storage_area, door_area)


def check_storage_connection_wall_interference(room, wall_side, storage_x, storage_y, storage_w, storage_h):
    """
    収納と接続壁の干渉をチェックします
    
    Args:
        room: 部屋オブジェクト
        wall_side: 収納を配置する壁
        storage_x, storage_y, storage_w, storage_h: 収納の座標とサイズ
    
    Returns:
        bool: 干渉がある場合True
    """
    # 接続壁情報を取得
    connection_walls = room.get_wall_between_connected_rooms()
    if not connection_walls:
        return False
    
    # 収納が配置される壁に接続壁がある場合は干渉とみなす
    for connected_room, walls_dict in connection_walls.items():
        if wall_side in walls_dict:
            return True
    
    return False


def check_storage_within_room_bounds(room, storage_x, storage_y, storage_w, storage_h):
    """
    収納が部屋の境界内に収まるかチェックします
    
    Args:
        room: 部屋オブジェクト
        storage_x, storage_y, storage_w, storage_h: 収納の座標とサイズ
    
    Returns:
        bool: 境界内に収まる場合True
    """
    return (storage_x >= room.x and 
            storage_y >= room.y and 
            storage_x + storage_w <= room.x + room.width and 
            storage_y + storage_h <= room.y + room.height)


def rectangles_overlap(rect1, rect2):
    """
    2つの長方形が重複するかチェックします
    
    Args:
        rect1, rect2: (x1, y1, x2, y2) 形式の長方形
    
    Returns:
        bool: 重複する場合True
    """
    x1_1, y1_1, x2_1, y2_1 = rect1
    x1_2, y1_2, x2_2, y2_2 = rect2
    
    return not (x2_1 <= x1_2 or x2_2 <= x1_1 or y2_1 <= y1_2 or y2_2 <= y1_1)


def find_alternative_storage_position(room, storage_width, storage_height, name):
    """
    収納の代替配置位置を探します
    
    Args:
        room: 部屋オブジェクト
        storage_width, storage_height: 収納のサイズ
        name: 収納名
    
    Returns:
        dict: 代替位置の情報、見つからない場合None
    """
    # 試行する位置の優先順位
    candidate_positions = [
        "northwest", "northeast", "southwest", "southeast",  # コーナー
        "north", "south", "east", "west"  # 壁沿い
    ]
    
    for wall_side in candidate_positions:
        if is_storage_placement_valid(room, wall_side, storage_width, storage_height):
            return {"wall_side": wall_side}
    
    return None


def print_storage_summary(room_list):
    """
    各部屋の収納配置状況を表示します
    
    Args:
        room_list (list): 部屋オブジェクトのリスト
    """
    print("\n=== 収納配置状況 ===")
    for room in room_list:
        if room.storages:
            print(f"\n{room.name}:")
            for storage in room.storages:
                # 収納の絶対座標を取得
                x, y, w, h = storage.get_absolute_coordinates()
                print(f"  - {storage.name}: {w:.1f}×{h:.1f}ユニット ({storage.wall_side}) 座標:({x:.1f}, {y:.1f})")
        else:
            print(f"\n{room.name}: 収納なし")


