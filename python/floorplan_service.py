
import config
from layout_gen import LayoutGenerator
from layout_viewer import LayoutViewer
from schemas import FloorplanInput

def generate_floorplan_from_input(input_data: FloorplanInput):
    """
    APIリクエストデータから間取り図を生成する関数。
    """
    # APIからの入力データをconfig形式に変換
    config.LAND_CONFIG['width'] = input_data.land_width_mm
    config.LAND_CONFIG['depth'] = input_data.land_depth_mm
    
    # room_configsをconfig.ROOM_CONFIGに変換
    # 注意: ここではAPIからの入力でconfigを完全に上書きします。
    # 本来は、より洗練されたマージ処理が望ましい場合があります。
    new_room_config = {}
    for room in input_data.room_configs:
        new_room_config[room.name] = {
            "width": room.width,
            "depth": room.depth,
            "min_width": room.min_width,
            "min_depth": room.min_depth,
            "connections": room.connections,
            "floor": room.floor,
            "fixedsize": room.fixedsize,
            "value": room.value,
            # exterior_connectionやstorageなど、他の属性も必要に応じて追加
        }
    config.ROOM_CONFIG = new_room_config

    # LayoutGeneratorのインスタンスを生成
    layout_gen_instance = LayoutGenerator()
    
    # 間取り生成を実行
    success = layout_gen_instance.generate_layout()
    
    if success:
        viewer = LayoutViewer()
        layout_data = viewer.visualize_layout(layout_gen_instance)
        return layout_data
    else:
        return {"error": "Failed to generate layout. Please check constraints."}
