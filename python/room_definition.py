"""
住宅の部屋を表すクラス定義モジュール。

このモジュールは、住宅の各種部屋を表現するためのクラス階層を提供します。
基底クラスのRoomから派生した各種部屋クラス（LivingRoom, BedRoomなど）が
含まれています。
"""
from __future__ import annotations

import config


class Door:
    """
    ドアを表すクラス。
    
    部屋の壁に設置されるドアの情報を管理します。
    """

    def __init__(self, parent_room, wall_side, position_ratio=0.0, width_units=1.0, absolute_position=None):
        """
        ドアオブジェクトを初期化します。
        
        Args:
            parent_room (Room): このドアが属する部屋。
            wall_side (str): ドアを設置する壁の辺 ("north", "south", "east", "west")。
            position_ratio (float): 壁の始点から見たドアの左端の相対位置 (0.0〜1.0)。
                                   例: 0.0は壁の左端（または下端）。
            width_units (float): ドアの幅（ユニット単位）。
        """
        if wall_side not in ["north", "south", "east", "west"]:
            raise ValueError("wall_side は 'north', 'south', 'east', 'west' のいずれかである必要があります。")
        if not (0.0 <= position_ratio <= 1.0):
            # position_ratioは壁の長さに対する相対位置なので、0.0-1.0の範囲を基本とする
            # 実際の配置は壁の長さとドア幅を考慮して調整される
            pass  # ここでは厳密なチェックをせず、配置時に調整
        if width_units <= 0:
            raise ValueError("width_units は正の値である必要があります。")

        self.parent_room = parent_room
        self.wall_side = wall_side
        self.width_units = width_units  # ドアの幅は固定せず、引数で受け取る
        self.absolute_position = absolute_position  # ドアの絶対位置を後で計算するための変数

        # 壁の長さを取得
        if self.wall_side in ["north", "south"]:
            wall_length = self.parent_room.width
        else:  # "east", "west"
            wall_length = self.parent_room.height

        # ドアが壁の内側に収まるように position_ratio を調整
        # position_ratio はドアの「始点」の相対位置とする
        # ドアの幅を考慮して、壁からはみ出ないようにする
        effective_max_ratio = 1.0 - (self.width_units / wall_length if wall_length > 0 else 0)
        if effective_max_ratio < 0: # ドア幅が壁長より大きい場合
             effective_max_ratio = 0

        self.position_ratio = max(0.0, min(position_ratio, effective_max_ratio))

    def get_absolute_coordinates(self):
        """
        ドアの絶対座標（始点と終点）を計算して返します。
        
        Returns:
            tuple: (x1, y1, x2, y2) ドアの始点と終点の座標（ユニット単位）。
        """

        if not self.absolute_position:
            room_x = self.parent_room.x
            room_y = self.parent_room.y
            room_width = self.parent_room.width
            room_height = self.parent_room.height
            
            door_start_offset = self.position_ratio * (room_width if self.wall_side in ["north", "south"] else room_height)

            if self.wall_side == "north":
                x1 = room_x + door_start_offset
                y1 = room_y + room_height
                x2 = x1 + self.width_units
                y2 = y1
            elif self.wall_side == "south":
                x1 = room_x + door_start_offset
                y1 = room_y
                x2 = x1 + self.width_units
                y2 = y1
            elif self.wall_side == "east":
                x1 = room_x + room_width
                y1 = room_y + door_start_offset
                x2 = x1
                y2 = y1 + self.width_units
            else:  # "west"
                x1 = room_x
                y1 = room_y + door_start_offset
                x2 = x1
                y2 = y1 + self.width_units

        if self.absolute_position:
            # absolute_positionが指定されている場合はそれを使用
            x1, y1, x2, y2 = self.absolute_position

        return x1, y1, x2, y2

    def __str__(self):
        return f"壁: {self.wall_side}, 位置比率: {self.position_ratio:.2f}, 幅: {self.width_units:.1f}ユニット"

class Storage:
    """
    部屋内の収納スペースを表すクラス。
    
    各部屋に設置される収納（クローゼット、押入れなど）の情報を管理します。
    """
    
    def __init__(self, parent_room, wall_side="none", position_ratio=0.0, width=1.0, height=1.0, name="収納"):
        """
        収納オブジェクトを初期化します。
        
        Args:
            parent_room (Room): この収納が属する部屋。
            wall_side (str): 収納を設置する壁またはコーナーの位置
                            壁: "north", "south", "east", "west"
                            コーナー: "northwest", "northeast", "southwest", "southeast"
                            自由配置: "none"
            position_ratio (float): 壁の始点から見た収納の左端/下端の相対位置 (0.0〜1.0)。
                                   コーナー指定の場合は使用されない。
            width (float): 収納の幅（ユニット単位）。
            height (float): 収納の高さ（ユニット単位）。
            name (str): 収納の名前（例: "クローゼット"、"押入れ"）。
        """
        self.parent_room = parent_room
        self.wall_side = wall_side
        self.position_ratio = max(0.0, min(1.0, position_ratio))
        self.width = width
        self.height = height
        self.name = name
        
        # 壁沿い、コーナー、自由配置の判定
        if wall_side in ["northwest", "northeast", "southwest", "southeast"]:
            self.is_wall_aligned = False
            self.is_corner = True
        elif wall_side in ["north", "south", "east", "west"]:
            self.is_wall_aligned = True
            self.is_corner = False
        else:
            self.is_wall_aligned = False
            self.is_corner = False
            self.x_ratio = self.position_ratio
            self.y_ratio = 0.0
        
    def get_absolute_coordinates(self):
        """
        収納の絶対座標を親部屋の座標を考慮して計算します。
        
        Returns:
            tuple: (x, y, width, height) 収納の左下座標と幅・高さ
        """
        room_x = self.parent_room.x
        room_y = self.parent_room.y
        room_width = self.parent_room.width
        room_height = self.parent_room.height
        
        # コーナーに配置する場合
        if self.is_corner:
            if self.wall_side == "northwest":  # 左上
                x = room_x
                y = room_y + room_height - self.height
            elif self.wall_side == "northeast":  # 右上
                x = room_x + room_width - self.width
                y = room_y + room_height - self.height
            elif self.wall_side == "southwest":  # 左下
                x = room_x
                y = room_y
            elif self.wall_side == "southeast":  # 右下
                x = room_x + room_width - self.width
                y = room_y
            else:
                # フォールバック
                x = room_x
                y = room_y
        # 壁沿いに配置する場合
        elif self.is_wall_aligned:
            if self.wall_side == "north":  # 北側の壁
                x = room_x + (room_width - self.width) * self.position_ratio
                y = room_y + room_height - self.height
            elif self.wall_side == "south":  # 南側の壁
                x = room_x + (room_width - self.width) * self.position_ratio
                y = room_y
            elif self.wall_side == "east":  # 東側の壁
                x = room_x + room_width - self.width
                y = room_y + (room_height - self.height) * self.position_ratio
            elif self.wall_side == "west":  # 西側の壁
                x = room_x
                y = room_y + (room_height - self.height) * self.position_ratio
            else:
                # フォールバック
                x = room_x
                y = room_y
        else:
            # 自由配置の場合
            x = room_x + (room_width - self.width) * self.x_ratio
            y = room_y + (room_height - self.height) * self.y_ratio
        
        return (x, y, self.width, self.height)

    def __str__(self):
        if self.is_corner:
            corner_name = {
                "northwest": "左上角",
                "northeast": "右上角",
                "southwest": "左下角",
                "southeast": "右下角"
            }.get(self.wall_side, "不明な角")
            return f"{self.name}: {self.width:.1f}×{self.height:.1f}ユニット ({corner_name})"
        elif self.is_wall_aligned:
            wall_name = {
                "north": "北壁",
                "south": "南壁",
                "east": "東壁",
                "west": "西壁"
            }.get(self.wall_side, "不明な壁")
            return f"{self.name}: {self.width:.1f}×{self.height:.1f}ユニット ({wall_name}沿い)"
        else:
            return f"{self.name}: {self.width:.1f}×{self.height:.1f}ユニット"


class Room:
    """
    部屋を表す基底クラス。
    
    全ての部屋タイプの基本となるクラスで、位置、サイズ、接続関係などの
    共通プロパティと機能を提供します。
    
    クラス変数:
        MODULE_SIZE_MM: モジュールサイズ（mm単位）
    """
    # モジュールサイズをconfigから取得
    MODULE_SIZE_MM = config.MODULE_SIZE_MM

    def __init__(self, x, y, width, height, floor, value, name="", connected_rooms=None):
        """
        部屋オブジェクトを初期化します。
        
        Args:
            x (float): 部屋左下のX座標（ユニット単位）
            y (float): 部屋左下のY座標（ユニット単位）
            width (float): 部屋の幅（ユニット単位）
            height (float): 部屋の高さ（ユニット単位）
            floor (int): 階数（1=一階、2=二階）
            name (str, optional): 部屋の名称
            connected_rooms (list, optional): 接続している部屋のリスト
        """
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.floor = floor
        self.name = name
        self.value = value
        # 接続部屋リストの初期化
        if connected_rooms is None:
            self.connected_rooms = []
        else:
            self.connected_rooms = connected_rooms

        # ドア情報を格納するリスト (Doorオブジェクトのリスト)
        self.doors = []

        # 収納情報を格納するリスト（Storageオブジェクトのリスト）
        self.storages = []

    def add_door(self, wall_side, position_ratio=0.0, width_units=1.0, absolute_position=None):
        """
        部屋にドアを追加します。
        
        Args:
            wall_side (str): ドアを設置する壁の辺 ("north", "south", "east", "west")
            position_ratio (float): 壁の始点から見たドアの左端の相対位置 (0.0〜1.0)
                               例: 0.0は壁の左端（または下端）
            width_units (float): ドアの幅（ユニット単位）。デフォルトは1.0。
        
        Returns:
            Door: 追加されたDoorオブジェクト。
        
        Raises:
            ValueError: パラメータが不正な値の場合。
        """
        # Doorオブジェクトを作成してリストに追加
        new_door = Door(self, wall_side, position_ratio, width_units, absolute_position)
        self.doors.append(new_door)
        return new_door

    def add_storage(self, wall_side, width, height, name):
        """
        部屋に収納を追加します。
        
        Args:
            wall_side (str): 収納を設置する壁またはコーナーの位置
                             壁: "north", "south", "east", "west"
                             コーナー: "northwest", "northeast", "southwest", "southeast"
                             自由配置: "none"
            width (float): 収納の幅（ユニット単位）
            height (float): 収納の高さ（ユニット単位）
            name (str): 収納の名前（例: "クローゼット"、"押入れ"）
        
        Returns:
            Storage: 追加されたStorageオブジェクト。
        """
        new_storage = Storage(self, wall_side, width=width, height=height, name=name)
        self.storages.append(new_storage)
        return new_storage

    def get_wall_positions(self):
        """壁の位置を返します"""
        """
        部屋の4つの壁の位置を計算して返します。
        
        Returns:
            dict: 壁の位置情報を含む辞書
                  {
                      "north": (x1, y1, x2, y2),
                      "south": (x1, y1, x2, y2),
                      "east": (x1, y1, x2, y2),
                      "west": (x1, y1, x2, y2)
                  }
        """
        return {
            "north": (self.x, self.y + self.height, self.x + self.width, self.y + self.height),
            "south": (self.x, self.y, self.x + self.width, self.y),
            "east": (self.x + self.width, self.y, self.x + self.width, self.y + self.height),
            "west": (self.x, self.y, self.x, self.y + self.height)
        }

    def get_center(self):
        """
        部屋の中心座標を返します。
        
        Returns:
            tuple: (center_x, center_y) 中心座標（ユニット単位）
        """
        return (self.x + self.width / 2, self.y + self.height / 2)

    def get_room_name(self):
        """
        部屋の名前を返します。
        
        Returns:
            str: 部屋の名前
        """
        return self.name

    def get_floor(self):
        """
        部屋の階数を返します。
        
        Returns:
            int: 階数（1=一階、2=二階）
        """
        return self.floor

    def calculate_tatami(self):
        """
        部屋の面積を畳数で計算します。
        
        1畳 = 1ユニット × 2ユニット として計算します。
        
        Returns:
            float: 畳数
        """
        area_units = self.width * self.height
        tatami_count = area_units / 2
        return tatami_count

    def connect_to(self, room):
        """
        指定した部屋との接続を追加します（相互接続）。
        
        Args:
            room (Room): 接続する部屋オブジェクト
            
        Returns:
            Room: メソッドチェーン用のself
        """
        if room not in self.connected_rooms:
            self.connected_rooms.append(room)
            if self not in room.connected_rooms:  # 相手側にも接続を追加
                room.connect_to(self)
        return self

    def disconnect_from(self, room):
        """
        指定した部屋との接続を削除します（相互接続も解除）。
        
        Args:
            room (Room): 接続を解除する部屋オブジェクト
            
        Returns:
            Room: メソッドチェーン用のself
        """
        if room in self.connected_rooms:
            self.connected_rooms.remove(room)
            if self in room.connected_rooms:  # 相手側の接続も解除
                room.disconnect_from(self)
        return self

    def is_connected_to(self, room):
        """
        指定した部屋と接続しているかどうかを返します。
        
        Args:
            room (Room): 接続を確認する部屋オブジェクト
            
        Returns:
            bool: 接続している場合はTrue、していない場合はFalse
        """
        return room in self.connected_rooms

    def get_connected_rooms(self):
        """
        接続している全ての部屋のリストを返します。
        
        Returns:
            list: 接続している部屋オブジェクトのリスト
        """
        return self.connected_rooms

    def get_wall_between_connected_rooms(self):
        """
        接続している部屋との共有壁の情報を返します。
    
        接続している各部屋との間で、どの壁がどのように共有されているかを
        計算し、辞書形式で返します。
    
        Returns:
            dict: {
                部屋オブジェクト: {
                    壁タイプ: (x1, y1, x2, y2)  # 壁の始点と終点の座標
                }
            }
        """
        all_shared_walls = {}  # 結果格納用辞書
        epsilon = 1e-6  # 浮動小数点比較のための許容誤差

        for connected_room in self.connected_rooms:
            # 自部屋の4辺の座標を計算
            self_south = (self.x, self.y, self.x + self.width, self.y)
            self_east = (self.x + self.width, self.y, self.x + self.width, self.y + self.height)
            self_north = (self.x, self.y + self.height, self.x + self.width, self.y + self.height)
            self_west = (self.x, self.y, self.x, self.y + self.height)

            # 接続部屋の4辺の座標を計算
            other_south = (connected_room.x, connected_room.y, connected_room.x + connected_room.width,
                           connected_room.y)
            other_east = (connected_room.x + connected_room.width, connected_room.y,
                          connected_room.x + connected_room.width, connected_room.y + connected_room.height)
            other_north = (connected_room.x, connected_room.y + connected_room.height,
                           connected_room.x + connected_room.width, connected_room.y + connected_room.height)
            other_west = (connected_room.x, connected_room.y, connected_room.x,
                          connected_room.y + connected_room.height)

            # 各壁の共有部分の計算
            north_x_list = sorted([self_north[0], self_north[2], other_south[0], other_south[2]])
            north_common_wall_x1 = north_x_list[1]
            north_common_wall_x2 = north_x_list[2]

            south_x_list = sorted([self_south[0], self_south[2], other_north[0], other_north[2]])
            south_common_wall_x1 = south_x_list[1]
            south_common_wall_x2 = south_x_list[2]

            east_y_list = sorted([self_east[1], self_east[3], other_west[1], other_west[3]])
            east_common_wall_y1 = east_y_list[1]
            east_common_wall_y2 = east_y_list[2]

            west_y_list = sorted([self_west[1], self_west[3], other_east[1], other_east[3]])
            west_common_wall_y1 = west_y_list[1]
            west_common_wall_y2 = west_y_list[2]

            shared_walls = {}

            # 北壁の共有判定（自部屋の北壁と接続部屋の南壁）
            aligned_north_south = abs(self_north[1] - other_south[1]) < epsilon
            overlap_north_south = (north_common_wall_x2 - north_common_wall_x1) > epsilon
            if aligned_north_south and overlap_north_south:
                shared_walls["north"] = (north_common_wall_x1, self_north[1], north_common_wall_x2, self_north[1])

            # 南壁の共有判定（自部屋の南壁と接続部屋の北壁）
            aligned_south_north = abs(self_south[1] - other_north[1]) < epsilon
            overlap_south_north = (south_common_wall_x2 - south_common_wall_x1) > epsilon
            if aligned_south_north and overlap_south_north:
                shared_walls["south"] = (south_common_wall_x1, self_south[1], south_common_wall_x2, self_south[1])

            # 東壁の共有判定（自部屋の東壁と接続部屋の西壁）
            aligned_east_west = abs(self_east[0] - other_west[0]) < epsilon
            overlap_east_west = (east_common_wall_y2 - east_common_wall_y1) > epsilon
            if aligned_east_west and overlap_east_west:
                shared_walls["east"] = (self_east[0], east_common_wall_y1, self_east[0], east_common_wall_y2)

            # 西壁の共有判定（自部屋の西壁と接続部屋の東壁）
            aligned_west_east = abs(self_west[0] - other_east[0]) < epsilon
            overlap_west_east = (west_common_wall_y2 - west_common_wall_y1) > epsilon
            if aligned_west_east and overlap_west_east:
                shared_walls["west"] = (self_west[0], west_common_wall_y1, self_west[0], west_common_wall_y2)

            # 共有壁が見つかった場合のみ結果に追加
            if shared_walls:
                all_shared_walls[connected_room] = shared_walls

        return all_shared_walls

    def get_adjacent_rooms(self, room_list):
        """
        接続条件関係なく隣接している部屋の名前と位置を返します。
        Args:
            room_list (list[Room]): 部屋のリスト
        Returns:
            all_adjacent_rooms (list): 隣接している部屋の名前と位置のリスト
        """

        all_adjacent_rooms = {}  # 結果格納用辞書
        epsilon = 1e-6  # 浮動小数点比較のための許容誤差

        for connected_room in room_list:
            if connected_room is not self:  # 自分自身は除外
                # 自部屋の4辺の座標を計算
                self_south = (self.x, self.y, self.x + self.width, self.y)
                self_east = (self.x + self.width, self.y, self.x + self.width, self.y + self.height)
                self_north = (self.x, self.y + self.height, self.x + self.width, self.y + self.height)
                self_west = (self.x, self.y, self.x, self.y + self.height)

                # 接続部屋の4辺の座標を計算
                other_south = (connected_room.x, connected_room.y, connected_room.x + connected_room.width,
                               connected_room.y)
                other_east = (connected_room.x + connected_room.width, connected_room.y,
                              connected_room.x + connected_room.width, connected_room.y + connected_room.height)
                other_north = (connected_room.x, connected_room.y + connected_room.height,
                               connected_room.x + connected_room.width, connected_room.y + connected_room.height)
                other_west = (connected_room.x, connected_room.y, connected_room.x,
                              connected_room.y + connected_room.height)

                # 各壁の共有部分の計算
                north_x_list = sorted([self_north[0], self_north[2], other_south[0], other_south[2]])
                north_common_wall_x1 = north_x_list[1]
                north_common_wall_x2 = north_x_list[2]

                south_x_list = sorted([self_south[0], self_south[2], other_north[0], other_north[2]])
                south_common_wall_x1 = south_x_list[1]
                south_common_wall_x2 = south_x_list[2]

                east_y_list = sorted([self_east[1], self_east[3], other_west[1], other_west[3]])
                east_common_wall_y1 = east_y_list[1]
                east_common_wall_y2 = east_y_list[2]

                west_y_list = sorted([self_west[1], self_west[3], other_east[1], other_east[3]])
                west_common_wall_y1 = west_y_list[1]
                west_common_wall_y2 = west_y_list[2]

                shared_walls = {}

                # 北壁の共有判定（自部屋の北壁と接続部屋の南壁）
                aligned_north_south = abs(self_north[1] - other_south[1]) < epsilon
                overlap_north_south = (north_common_wall_x2 - north_common_wall_x1) > epsilon
                if aligned_north_south and overlap_north_south:
                    shared_walls["north"] = (north_common_wall_x1, self_north[1], north_common_wall_x2, self_north[1])

                # 南壁の共有判定（自部屋の南壁と接続部屋の北壁）
                aligned_south_north = abs(self_south[1] - other_north[1]) < epsilon
                overlap_south_north = (south_common_wall_x2 - south_common_wall_x1) > epsilon
                if aligned_south_north and overlap_south_north:
                    shared_walls["south"] = (south_common_wall_x1, self_south[1], south_common_wall_x2, self_south[1])

                # 東壁の共有判定（自部屋の東壁と接続部屋の西壁）
                aligned_east_west = abs(self_east[0] - other_west[0]) < epsilon
                overlap_east_west = (east_common_wall_y2 - east_common_wall_y1) > epsilon
                if aligned_east_west and overlap_east_west:
                    shared_walls["east"] = (self_east[0], east_common_wall_y1, self_east[0], east_common_wall_y2)

                # 西壁の共有判定（自部屋の西壁と接続部屋の東壁）
                aligned_west_east = abs(self_west[0] - other_east[0]) < epsilon
                overlap_west_east = (west_common_wall_y2 - west_common_wall_y1) > epsilon
                if aligned_west_east and overlap_west_east:
                    shared_walls["west"] = (self_west[0], west_common_wall_y1, self_west[0], west_common_wall_y2)

                # 共有壁が見つかった場合のみ結果に追加 # 共有壁が見つかった場合のみ結果に追加
                if shared_walls:
                    all_adjacent_rooms[connected_room] = shared_walls

        return all_adjacent_rooms

# 各種部屋クラスの定義
# 基底クラス(Room)を継承し、特定の部屋タイプを表現します

class Hallway(Room):
    """廊下を表すクラス"""

    def __init__(self, x, y, width, height, name="廊下", floor=1, value=1, connected_rooms=None):
        super().__init__(x, y, width, height, floor, value, name, connected_rooms=connected_rooms)


class LivingRoom(Room):
    """リビングルームを表すクラス"""

    def __init__(self, x, y, width, height, name="リビング", floor=1, value=1, connected_rooms=None):
        super().__init__(x, y, width, height, floor, value, name, connected_rooms=connected_rooms)


class DiningRoom(Room):
    """ダイニングルームを表すクラス"""

    def __init__(self, x, y, width, height, name="ダイニング", floor=1, value=1, connected_rooms=None):
        super().__init__(x, y, width, height, floor, value, name, connected_rooms=connected_rooms)


class Kitchen(Room):
    """キッチンを表すクラス"""

    def __init__(self, x, y, width, height, name="キッチン", floor=1, value=1, connected_rooms=None):
        super().__init__(x, y, width, height, floor, value, name, connected_rooms=connected_rooms)


class Entrance(Room):
    """玄関（エントランス）を表すクラス"""

    def __init__(self, x, y, width, height, name="エントランス", floor=1, value=1, connected_rooms=None):
        super().__init__(x, y, width, height, floor, value, name, connected_rooms=connected_rooms)


class JapaneseStyleRoom(Room):
    """和室を表すクラス"""

    def __init__(self, x, y, width, height, name="和室", floor=1, value=1, connected_rooms=None):
        super().__init__(x, y, width, height, floor, value, name, connected_rooms=connected_rooms)


class Stairs(Room):
    """階段を表すクラス"""

    def __init__(self, x, y, width, height, name="階段", floor=1, value=1, connected_rooms=None, pattern="stairs"):
        super().__init__(x, y, width, height, floor, value, name, connected_rooms=connected_rooms)
        self.pattern = pattern

    def get_pattern(self):
        """
        階段のパターンを返します。
        
        Returns:
            pattern(str): 階段のパターン名 
                "straight"  直進階段
                "L-shaped"  L字階段
                "U-shaped"  U字（折り返し）階段
                "square"    正方形型（回り階段など）
        """
        return self.pattern


class BathRoom(Room):
    """浴室を表すクラス"""

    def __init__(self, x, y, width, height, name="浴室", floor=1, value=1, connected_rooms=None):
        super().__init__(x, y, width, height, floor, value, name, connected_rooms=connected_rooms)


class Toilet(Room):
    """トイレを表すクラス"""

    def __init__(self, x, y, width, height, name="トイレ", floor=1, value=1, connected_rooms=None):
        super().__init__(x, y, width, height, floor, value, name, connected_rooms=connected_rooms)


class Balcony(Room):
    """バルコニーを表すクラス"""

    def __init__(self, x, y, width, height, name="バルコニー", floor=1, value=1, connected_rooms=None):
        super().__init__(x, y, width, height, floor, value, name, connected_rooms=connected_rooms)


class Closet(Room):
    """収納を表すクラス"""

    def __init__(self, x, y, width, height, name="収納", floor=1, value=1, connected_rooms=None):
        super().__init__(x, y, width, height, floor, value, name, connected_rooms=connected_rooms)


class WashRoom(Room):
    """洗面所を表すクラス"""

    def __init__(self, x, y, width, height, name="洗面所", floor=1, value=1, connected_rooms=None):
        super().__init__(x, y, width, height, floor, value, name, connected_rooms=connected_rooms)


class WalkInCloset(Room):
    """ウォークインクローゼットを表すクラス"""

    def __init__(self, x, y, width, height, name="ウォークインクローゼット", floor=1, value=1, connected_rooms=None):
        super().__init__(x, y, width, height, floor, value, name, connected_rooms=connected_rooms)


class BedRoom(Room):
    """寝室を表すクラス"""

    def __init__(self, x, y, width, height, name="寝室", floor=1, value=1, connected_rooms=None):
        super().__init__(x, y, width, height, floor, value, name, connected_rooms=connected_rooms)


class Corridor(Room):
    """廊下（Corridor）を表す新しいクラス"""

    def __init__(self, x, y, width, height, name="廊下", floor=1, value=1, connected_rooms=None):
        super().__init__(x, y, width, height, floor, value, name, connected_rooms=connected_rooms)
