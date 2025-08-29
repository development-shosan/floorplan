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
