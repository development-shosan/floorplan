import config
# import matplotlib.pyplot as plt
# import matplotlib.patches as patches
# import room_definition as rd
# import math

class LayoutViewer:
    """
    間取り図データ生成クラス。
    最適化された部屋の配置情報を、APIが返すべきJSON形式に整形します。
    """
    def visualize_layout(self, layout_generator):
        """
        生成器インスタンスから間取り図データを取得し、
        API応答に適した辞書形式で返します。
        """
        if not layout_generator or not layout_generator.room_list:
            return {"error": "間取り図が生成されていません。"}

        print("間取り図データをAPI応答用に整形します。")
        
        layout_data = {
            "land_width_mm": config.LAND_CONFIG['width'],
            "land_depth_mm": config.LAND_CONFIG['depth'],
            "floors": {}
        }

        # 階ごとに部屋を整理
        for room in layout_generator.get_room_objects():
            floor_key = f"floor_{room.floor}"
            if floor_key not in layout_data["floors"]:
                layout_data["floors"][floor_key] = []

            room_data = {
                "name": room.name,
                "x": room.x,
                "y": room.y,
                "width": room.width,
                "height": room.height,
                "tatami": room.calculate_tatami(),
                "doors": [],
                "storages": []
            }

            # ドア情報を追加
            if hasattr(room, 'doors') and room.doors:
                for door in room.doors:
                    x1, y1, x2, y2 = door.get_absolute_coordinates()
                    room_data["doors"].append({
                        "wall_side": door.wall_side,
                        "position_ratio": door.position_ratio,
                        "width_units": door.width_units,
                        "coordinates": { "x1": x1, "y1": y1, "x2": x2, "y2": y2 }
                    })

            # 収納情報を追加
            if hasattr(room, 'storages') and room.storages:
                for storage in room.storages:
                    x, y, w, h = storage.get_absolute_coordinates()
                    room_data["storages"].append({
                        "name": storage.name,
                        "wall_side": storage.wall_side,
                        "width": w,
                        "height": h,
                        "coordinates": { "x": x, "y": y }
                    })
            
            layout_data["floors"][floor_key].append(room_data)

        return layout_data

    # """
    # 以下は、元々の画像生成ロジックです。
    # 将来的な参考のためにコメントアウトして残しておきます。
    # """
    # def __init__(self, figsize=(16, 6)):
    #     """
    # 間取り図表示クラスの初期化。
        
    #     Args:
    #         figsize (tuple): 図のサイズ（横, 縦）（インチ単位）
    #     """
    #     # 日本語フォント対応のための設定
    #     plt.rcParams['font.family'] = 'Yu Gothic'
    #     plt.rcParams['axes.unicode_minus'] = False
        
    #     self.figsize = figsize
    #     self.fig = None
    #     self.ax1 = None  # 一階用の描画領域
    #     self.ax2 = None  # 二階用の描画領域
    
    # def create_figure(self):
    #     """
    # 図とサブプロットを作成します。
        
    #     一階と二階の間取りを表示するための2つのサブプロットを持つ
    #     図を生成します。
        
    #     Returns:
    #         tuple: (fig, ax1, ax2) Matplotlib図オブジェクトと2つの座標軸
    #     """
    #     self.fig, (self.ax1, self.ax2) = plt.subplots(1, 2, figsize=self.figsize)
    #     self.ax1.set_title("一階の間取り")
    #     self.ax2.set_title("二階の間取り")
    #     return self.fig, self.ax1, self.ax2
    
    # def setup_axes(self):
    #     """
    # 描画領域の軸の設定を行います。
        
    #     両方のサブプロットに対して、適切な範囲、縦横比、グリッド線などを
    #     設定します。
    #     """
    #     # 土地サイズをユニット単位に変換
    #     land_width_units = config.LAND_CONFIG['width'] / config.MODULE_SIZE_MM
    #     land_depth_units = config.LAND_CONFIG['depth'] / config.MODULE_SIZE_MM
        
    #     # 一階の軸設定
    #     self.ax1.set_xlim(-1, land_width_units + 1)
    #     self.ax1.set_ylim(-1, land_depth_units + 1)
    #     self.ax1.set_aspect('equal')  # 縦横比を等しく
    #     self.ax1.set_xticks([0, land_width_units])
    #     self.ax1.set_yticks([0, land_depth_units])
    #     self.ax1.grid(True, linestyle='--', color='gray', alpha=0.7)
        
    #     # 二階の軸設定
    #     self.ax2.set_xlim(-1, land_width_units + 1)
    #     self.ax2.set_ylim(-1, land_depth_units + 1)
    #     self.ax2.set_aspect('equal')  # 縦横比を等しく
    #     self.ax2.set_xticks([0, land_width_units])
    #     self.ax2.set_yticks([0, land_depth_units])
    #     self.ax2.grid(True, linestyle='--', color='gray', alpha=0.7)
    
    # def draw_land(self):
    #     """
    # 土地の外形を描画します。
        
    #     一階と二階の両方のサブプロットに、土地の境界線を示す長方形を
    #     描画します。
    #     """
    #     # 土地サイズをユニット単位に変換
    #     land_width_units = config.LAND_CONFIG['width'] / config.MODULE_SIZE_MM
    #     land_depth_units = config.LAND_CONFIG['depth'] / config.MODULE_SIZE_MM
        
    #     # 一階の土地
    #     rect1 = patches.Rectangle(
    #         (0, 0), 
    #         land_width_units, 
    #         land_depth_units,
    #         fill=False, 
    #         edgecolor='blue', 
    #         linewidth=2
    #     )
    #     self.ax1.add_patch(rect1)
        
    #     # 二階の土地
    #     rect2 = patches.Rectangle(
    #         (0, 0), 
    #         land_width_units, 
    #         land_depth_units,
    #         fill=False, 
    #         edgecolor='blue', 
    #         linewidth=2
    #     )
    #     self.ax2.add_patch(rect2)
    
    # def add_direction_labels(self, ax):
    #     """
    # 図の外周に方位ラベルを追加します。
        
    #     Args:
    #         ax (matplotlib.axes.Axes): 描画先のmatplotlib Axesオブジェクト
    #     """
    #     # 土地サイズをユニット単位に変換
    #     land_width_units = config.LAND_CONFIG['width'] / config.MODULE_SIZE_MM
    #     land_depth_units = config.LAND_CONFIG['depth'] / config.MODULE_SIZE_MM
        
    #     # 外周に方位ラベルを配置
    #     # 北（上）
    #     ax.text(land_width_units/2, land_depth_units + 0.3, '北 (N)', 
    #             ha='center', va='bottom', fontsize=12, fontweight='bold', color='blue')
        
    #     # 南（下）
    #     ax.text(land_width_units/2, -0.3, '南 (S)', 
    #             ha='center', va='top', fontsize=12, fontweight='bold', color='blue')
        
    #     # 東（右）
    #     ax.text(land_width_units + 0.2, land_depth_units/2, '東\n(E)', 
    #             ha='left', va='center', fontsize=12, fontweight='bold', color='blue')
        
    #     # 西（左）
    #     ax.text(-0.2, land_depth_units/2, '西\n(W)', 
    #             ha='right', va='center', fontsize=12, fontweight='bold', color='blue')

    # def get_room_color(self, room):
    #     """
    # 部屋の種類に基づいて塗りつぶし色を返します。
        
    #     Args:
    #         room (Room): 部屋オブジェクト
            
    #     Returns:
    #         str: カラーコードまたは色名
    #     """
    #     colors = {
    #         'Entrance': 'lightblue',      # 玄関
    #         'LivingRoom': 'lightyellow',  # リビング
    #         'BedRoom': 'lightgreen',      # 寝室
    #         'Kitchen': 'lightpink',       # キッチン
    #         'DiningRoom': 'moccasin',     # ダイニング
    #         'Hallway': 'lightgray',       # 廊下
    #         'Toilet': 'lightcyan',        # トイレ
    #         'BathRoom': 'lightskyblue',   # 浴室
    #         'WashRoom': 'paleturquoise',  # 洗面所
    #         'JapaneseStyleRoom': 'wheat', # 和室
    #         'Stairs': 'silver',           # 階段
    #         'Closet': 'lavender',         # 収納
    #         'WalkInCloset': 'thistle'     # ウォークインクローゼット
    #     }
    #     # roomオブジェクトのクラス名に基づいて色を返す
    #     class_name = room.__class__.__name__
    #     return colors.get(class_name, 'white')  # デフォルトは白
    
    # def draw_room(self, room, ax, facecolor=None, alpha=0.7):
    #     """
    # 部屋オブジェクトを指定された描画領域に描画します。
        
    #     部屋の長方形を描き、名前と畳数を中央に表示します。
        
    #     Args:
    #         room (Room): 部屋オブジェクト
    #         ax (matplotlib.axes.Axes): 描画先のmatplotlib Axesオブジェクト
    #         facecolor (str, optional): 部屋の塗りつぶし色（指定なしの場合は自動判定）
    #         alpha (float): 透明度（0.0〜1.0）
    #     """
    #     # 色が指定されていない場合は自動判定
    #     if facecolor is None:
    #         facecolor = self.get_room_color(room)
            
    #     # 部屋の長方形を描画（座標はユニット単位で）
    #     room_rect = patches.Rectangle(
    #         (room.x,
    #         room.y),
    #         room.width, 
    #         room.height,
    #         fill=True, 
    #         facecolor=facecolor, 
    #         edgecolor='black', 
    #         linewidth=1.5,
    #         alpha=alpha
    #     )
    #     ax.add_patch(room_rect)

    #     # 畳数を計算
    #     tatami_count = room.calculate_tatami()

    #     # 部屋名と畳数を一緒に中心に表示
    #     room_info_text = f"{room.name} ({tatami_count:.1f}畳)"
    #     ax.text(
    #         room_center_x, 
    #         room_center_y, 
    #         room_info_text, 
    #         ha='center', 
    #         va='center', 
    #         fontsize=10
    #     )
    
    # def draw_rooms(self, rooms):
    #     """
    # 複数の部屋オブジェクトを描画します。
        
    #     各部屋を適切な階の描画領域に振り分けて描画します。
        
    #     Args:
    #         rooms (list): 部屋オブジェクトのリスト
    #     """
    #     for room in rooms:
    #         if room.floor == 1:
    #             # 一階の部屋
    #             self.draw_room(room, self.ax1)
    #         elif room.floor == 2:
    #             # 二階の部屋
    #             self.draw_room(room, self.ax2)
    
    # def draw_doors(self, layout_generator):
    #     """
    # 部屋間のドアを描画します。
        
    #     各部屋のdoors属性（Doorオブジェクトのリスト）を使用して
    #     部屋の壁に設置されたドアを描画します。ドアは部屋の属性（要素）として
    #     管理されており、各ドアオブジェクトには位置情報や幅などが含まれています。
        
    #     Args:
    #         layout_generator (LayoutGenerator): レイアウト生成クラスのインスタンス
    #                                            （部屋オブジェクトのリストを保持）
    #     """
    #     door_line_width = 3     # ドアを示す線の太さ
    #     door_color = 'red'      # ドアの色（赤色で目立たせる）

    #     # 全ての部屋を調べてドアを描画
    #     for room in layout_generator.get_room_objects():
    #         # 部屋の階数に応じて描画先の座標軸を選択
    #         ax = self.ax1 if room.floor == 1 else self.ax2
            
    #         # ドアがない部屋はスキップ
    #         if not room.doors:
    #             continue

    #         # 部屋が持つ各ドアを描画
    #         for door_obj in room.doors:
    #             # ドアの絶対座標（部屋の位置を考慮した実際の座標）を取得
    #             x1_unit, y1_unit, x2_unit, y2_unit = door_obj.get_absolute_coordinates()
                
    #             # 座標はユニット単位でそのまま使用
    #             x1 = x1_unit
    #             y1 = y1_unit
    #             x2 = x2_unit
    #             y2 = y2_unit
                
    #             # ドアを線として描画（2点間の接続線）
    #             door_line = patches.ConnectionPatch(
    #                 (x1, y1), (x2, y2),          # 線の始点と終点
    #                 coordsA="data", coordsB="data",   # 座標系の指定
    #                 axesA=ax, axesB=ax,              # 描画先の座標軸
    #                 color=door_color,                # 線の色
    #                 linewidth=door_line_width,       # 線の太さ
    #                 zorder=5                         # 描画順序（他の要素より前面に表示）
    #             )
    #             ax.add_patch(door_line)
    # def draw_storage(self, layout_generator):
    #     """
    # 収納スペースを描画します。
        
    #     各部屋の収納スペース（ClosetやWalkInCloset）を描画します。
        
    #     Args:
    #         layout_generator (LayoutGenerator): レイアウト生成クラスのインスタンス
    #     """
    #     storage_color = 'lightcoral'
    #     storage_alpha = 0.6
    #     storage_edge_color = 'darkred'
    #     storage_line_width = 1.5
        
    #     # 全ての部屋を調べて収納を描画
    #     for room in layout_generator.get_room_objects():
    #         # 部屋の階数に応じて描画先の座標軸を選択
    #         ax = self.ax1 if room.floor == 1 else self.ax2
            
    #         # 収納がない部屋はスキップ
    #         if not room.storages:
    #             continue
            
    #         # 部屋が持つ各収納を描画
    #         for storage_obj in room.storages:
    #             # 収納の絶対座標（部屋の位置を考慮した実際の座標）を取得
    #             x, y, width, height = storage_obj.get_absolute_coordinates()
                
    #             # 座標をピクセル単位に変換（描画用）
    #             x_px = x * config.MODULE_SIZE_MM
    #             y_px = y * config.MODULE_SIZE_MM
    #             width_px = width * config.MODULE_SIZE_MM
    #             height_px = height * config.MODULE_SIZE_MM
                
    #             # 収納を長方形として描画
    #             storage_rect = patches.Rectangle(
    #                 (x_px,
    #                 y_px),
    #                 width_px,
    #                 height_px,
    #                 fill=True,
    #                 facecolor=storage_color,
    #                 edgecolor=storage_edge_color,
    #                 linewidth=storage_line_width,
    #                 alpha=storage_alpha,
    #                 zorder=3  # 部屋より前面、ドアより後面に表示
    #             )
    #             ax.add_patch(storage_rect)
                
    #             # 収納名を中央に表示
    #             storage_center_x = x_px + width_px / 2
    #             storage_center_y = y_px + height_px / 2
    #             ax.text(
    #                 storage_center_x,
    #                 storage_center_y,
    #                 storage_obj.name,
    #                 ha='center',
    #                 va='center',
    #                 fontsize=8,
    #                 fontweight='bold',
    #                 color='white',
    #                 zorder=4
    #             )
    # def show(self):
    #     """図を表示します."""
    #     plt.tight_layout()
    #     plt.show()
    
    # def _visualize_layout_image(self, layout_generator, show_direction_labels=True):
    #     """
    # 間取りを一括で可視化します。
        
    #     Args:
    #         layout_generator (LayoutGenerator): レイアウト生成クラスのインスタンス
    #         show_direction_labels (bool): 方位ラベルを表示するかどうか
    #     """
    #     self.create_figure()
    #     self.setup_axes()
    #     self.draw_land()
        
    #     rooms = layout_generator.get_room_objects()
    #     if rooms:
    #         self.draw_rooms(rooms)
    #         self.draw_doors(layout_generator)
    #         self.draw_storage(layout_generator)  # 収納の描画を追加
        
    #     if show_direction_labels:
    #         self.add_direction_labels(self.ax1)
    #         self.add_direction_labels(self.ax2)
            
    #     self.show()
    
    # def save_layout(self, filename, layout_generator, show_direction_labels=True, dpi=300):
    #     """
    # 間取り図を画像ファイルとして保存します。
        
    #     Args:
    #         filename (str): 保存するファイル名（拡張子を含む）。例: 'layout.png'
    #         layout_generator (LayoutGenerator): レイアウト生成クラスのインスタンス
    #         show_direction_labels (bool): 方位ラベルを表示するかどうか
    #         dpi (int): 画像の解像度（dots per inch）
    #     """
    #     self.create_figure()
    #     self.setup_axes()
    #     self.draw_land()
        
    #     rooms = layout_generator.get_room_objects()
    #     if rooms:
    #         self.draw_rooms(rooms)
    #         self.draw_doors(layout_generator)
    #         self.draw_storage(layout_generator)  # 収納の描画を追加
        
    #     if show_direction_labels:
    #         self.add_direction_labels(self.ax1)
    #         self.add_direction_labels(self.ax2)
        
    #     plt.tight_layout()
        
    #     # 図をファイルに保存
    #     self.fig.savefig(filename, dpi=dpi, bbox_inches='tight')
    #     print(f"間取り図を {filename} に保存しました。")
        
    #     # リソースの解放
    #     plt.close(self.fig)