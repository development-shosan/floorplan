def _add_non_overlap_for_room_pair(model, room_positions, i, j):
    """2つの部屋が重ならないための制約を追加"""
    x_i = room_positions[i]['x']
    y_i = room_positions[i]['y']
    x_j = room_positions[j]['x']
    y_j = room_positions[j]['y']
    w_i = room_positions[i]['w']
    h_i = room_positions[i]['h']
    w_j = room_positions[j]['w']
    h_j = room_positions[j]['h']

    left = model.NewBoolVar(f'left_{i}_{j}')
    model.Add(x_i + w_i <= x_j).OnlyEnforceIf(left)
    right = model.NewBoolVar(f'right_{i}_{j}')
    model.Add(x_j + w_j <= x_i).OnlyEnforceIf(right)
    below = model.NewBoolVar(f'below_{i}_{j}')
    model.Add(y_i + h_i <= y_j).OnlyEnforceIf(below)
    above = model.NewBoolVar(f'above_{i}_{j}')
    model.Add(y_j + h_j <= y_i).OnlyEnforceIf(above)
    model.AddBoolOr([left, right, below, above])

def _add_adjacency_for_room_pair(model, room_positions, i, j, SCALING_FACTOR):
    """2つの接続部屋が隣接するための制約を追加（サイズ変数対応）"""
    x_i = room_positions[i]['x']
    y_i = room_positions[i]['y']
    w_i = room_positions[i]['w']
    h_i = room_positions[i]['h']
    x_j = room_positions[j]['x']
    y_j = room_positions[j]['y']
    w_j = room_positions[j]['w']
    h_j = room_positions[j]['h']

    # 左右で隣接（y方向で1マス以上重なり、x端が一致）
    left_adjacent = model.NewBoolVar(f'left_adjacent_{i}_{j}')
    model.Add(x_i + w_i == x_j).OnlyEnforceIf(left_adjacent)
    model.Add(y_i + SCALING_FACTOR <= y_j + h_j).OnlyEnforceIf(left_adjacent)
    model.Add(y_j + SCALING_FACTOR <= y_i + h_i).OnlyEnforceIf(left_adjacent)

    right_adjacent = model.NewBoolVar(f'right_adjacent_{i}_{j}')
    model.Add(x_j + w_j == x_i).OnlyEnforceIf(right_adjacent)
    model.Add(y_i + SCALING_FACTOR <= y_j + h_j).OnlyEnforceIf(right_adjacent)
    model.Add(y_j + SCALING_FACTOR <= y_i + h_i).OnlyEnforceIf(right_adjacent)

    # 上下で隣接（x方向で1マス以上重なり、y端が一致）
    below_adjacent = model.NewBoolVar(f'below_adjacent_{i}_{j}')
    model.Add(y_i + h_i == y_j).OnlyEnforceIf(below_adjacent)
    model.Add(x_i + SCALING_FACTOR <= x_j + w_j).OnlyEnforceIf(below_adjacent)
    model.Add(x_j + SCALING_FACTOR <= x_i + w_i).OnlyEnforceIf(below_adjacent)

    above_adjacent = model.NewBoolVar(f'above_adjacent_{i}_{j}')
    model.Add(y_j + h_j == y_i).OnlyEnforceIf(above_adjacent)
    model.Add(x_i + SCALING_FACTOR <= x_j + w_j).OnlyEnforceIf(above_adjacent)
    model.Add(x_j + SCALING_FACTOR <= x_i + w_i).OnlyEnforceIf(above_adjacent)

    # いずれかの辺で隣接していればOK
    model.AddBoolOr([left_adjacent, right_adjacent, below_adjacent, above_adjacent])

def _add_distance_vars_for_room_pair(model, room_positions, i, j, land_width_scaled, land_depth_scaled):
    """2つの接続部屋間の距離変数を定義"""
    x_i = room_positions[i]['x']
    y_i = room_positions[i]['y']
    x_j = room_positions[j]['x']
    y_j = room_positions[j]['y']

    # x方向の距離
    dist_x = model.NewIntVar(0, land_width_scaled, f'dist_x_{i}_{j}')
    model.Add(dist_x >= x_i - x_j)
    model.Add(dist_x >= x_j - x_i)
        
    # y方向の距離
    dist_y = model.NewIntVar(0, land_depth_scaled, f'dist_y_{i}_{j}')
    model.Add(dist_y >= y_i - y_j)
    model.Add(dist_y >= y_j - y_i)
        
    return [dist_x, dist_y]

def add_direct_connection_constraints(room_list, model, is_directly_connected):
    """
    部屋間の直接接続制約を追加します。

    Args:
        room_list: 部屋インスタンスのリスト
        model: OR-Toolsのモデル
        is_directly_connected: 直接接続されているかどうかのブール変数
    """
    for i in range(len(room_list)):
        for j in range(i + 1, len(room_list)):
            room_i = room_list[i]
            room_j = room_list[j]

            # 直接接続されている場合のみ制約を追加
            if is_directly_connected[i][j]:
                _add_adjacency_for_room_pair(model, room_i, room_j, SCALING_FACTOR)

    model.Add(sum(adjacent_constraints) >= 1).OnlyEnforceIf(is_directly_connected)
