"""
間取り生成システムの設定モジュール。

部屋のサイズ、接続関係、階数など、間取り生成に必要な
基本パラメータを定義します。
"""

# 外部空間の定義 (仮想的な接続対象)
EXTERIOR = "外部"

# 土地の設定情報（単位: mm）
LAND_CONFIG = {
    "width": 10465,   # 幅（mm）
    "depth": 6825,   # 奥行き（mm）
}

# モジュールのサイズ（単位: mm）
# 1ユニット = 910mm（約半間）
MODULE_SIZE_MM = 910

# 部屋の設定情報
ROOM_CONFIG = {
    # 一階の部屋
    "エントランス": {
        "width": 2,
        "depth": 2,
        "min_width": 1.5,
        "min_depth": 1.5,
        "connections": ["客間", "リビング","収納"],
        "floor": 1,
        "fixedsize": False,
        "value": 1,
        "exterior_connection": {
            "required": True,
            "min_length": 1.5
        }
    },
    "客間": {
        "width": 3.5,
        "depth": 4.5,  
        "min_width": 2,
        "min_depth": 2,
        "connections": ["廊下1", "エントランス"],
        "floor": 1,
        "fixedsize": False,
        "value": 1
    },
    "浴室": {
        "width": 2,
        "depth": 2,
        "min_width": 1.5,
        "min_depth": 1.5,
        "connections": ["脱衣室"],
        "floor": 1,
        "fixedsize": False,
        "value": 1
    },
    "脱衣室": {
        "width": 1.5,
        "depth": 2, 
        "min_width": 1,
        "min_depth": 1.5,
        "connections": ["浴室", "洗面所"],
        "floor": 1,
        "fixedsize": False,
        "value": 1
    },
    "キッチン": {
        "width": 3,  # 4から3に縮小
        "depth": 3,
        "min_width": 1.5,
        "min_depth": 2,
        "connections": ["ダイニング", "リビング","洗面台","客間"],
        "floor": 1,
        "fixedsize": False,
        "value": 1
    },
    "リビング": {
        "width": 5,
        "depth": 4,
        "min_width": 3,
        "min_depth": 3,
        "connections": ["キッチン","エントランス", "階段1"],
        "floor": 1,
        "fixedsize": False,  # Trueから変更して柔軟性を持たせる
        "value": 5
    },
    "ダイニング": {
        "width": 3,
        "depth": 3,
        "min_width": 1.5,
        "min_depth": 2,
        "connections": ["キッチン", "リビング"],
        "floor": 1,
        "fixedsize": False,
        "value": 1
    },
    "トイレ1": {
        "width": 2,
        "depth": 1,
        "connections": ["廊下1"],  # "廊下"から"廊下1"に修正
        "floor": 1,
        "fixedsize": True,
        "value": 1
    },
    "階段1": {
        "width": 1,
        "depth": 3,
        "connections": ["リビング"],
        "floor": 1,
        "fixedsize": True,
        "value": 1
    },
    "洗面所": {
        "width": 1,
        "depth": 2,
        "min_width": 1,
        "min_depth": 1.5,
        "connections": ["脱衣室","廊下1"],
        "floor": 1,
        "fixedsize": False,
        "value": 1
    },
    "廊下1" : {
        "width": 3.5, 
        "depth": 1,
        "min_width": 1,
        "min_depth": 1,
        "connections": [],
        "floor": 1,
        "fixedsize": False,
        "value": 1
    },
    "収納": {
        "width": 2,
        "depth": 2,
        "connections": ["エントランス"],
        "floor": 1,
        "fixedsize": True,
        "value": 1
    },
    # 二階の部屋
    "廊下" : {
        "width": 3, 
        "depth": 1, 
        "min_width": 1, 
        "min_depth": 1, 
        "connections": [], 
        "floor": 2, 
        "fixedsize": False,
        "value": 1
    },
    "副廊下": {
        "width": 1.5,
        "depth": 1,
        "min_width": 1,
        "min_depth": 1,
        "connections": [],
        "floor": 2,
        "fixedsize": False,
        "value": 1
    },
    "ウォークインクローゼット": {
        "width": 2,
        "depth": 2,
        "connections": ["寝室"],
        "floor": 2,
        "fixedsize": True,
        "value": 1
    },
    "子供部屋1": {
        "width": 3,  # 3.5から3に縮小
        "depth": 3,  # 4から3.5に縮小
        "min_width": 2.5,
        "min_depth": 2.5,
        "connections": ["バルコニー","階段2"],
        "floor": 2,
        "fixedsize": False,
        "value": 2,
        "exterior_connection": {
            "required": True,
            "min_length": 2.0
        }
    },
    "子供部屋2": {
        "width": 3,  # 3.5から3に縮小
        "depth": 3,  # 4から3.5に縮小
        "min_width": 2.5,
        "min_depth": 2.5,
        "connections": ["バルコニー","階段2"],
        "floor": 2,
        "fixedsize": False,
        "value": 2,
        "exterior_connection": {
            "required": True,
            "min_length": 2.0
        }
    },
    "トイレ2": {
        "width": 2,  # 2から1.5に縮小
        "depth": 1,
        "connections": ["階段2"],
        "floor": 2,
        "fixedsize": True,
        "value": 1
    },
    "寝室": {
        "width": 3.5,
        "depth": 3.5,  # 4から3.5に縮小
        "min_width": 3,
        "min_depth": 3,
        "connections": ["ウォークインクローゼット", "バルコニー","階段2"],
        "floor": 2,
        "fixedsize": False,  # Trueから変更
        "value": 3
    },
    "階段2": {
        "width": 1,
        "depth": 3,
        "connections": [],  # "副廊下"との接続を削除
        "floor": 2,
        "fixedsize": True,
        "value": 1
    },
    "バルコニー": {
        "width": 12,
        "depth": 1.5,
        "min_width": 7,
        "min_depth": 1.5,
        "connections": ["子供部屋1", "子供部屋2", "寝室"],
        "floor": 2,
        "fixedsize": False,
        "value": 1
    },
}