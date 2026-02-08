# Kế hoạch Mô phỏng Sưu tập Huy hiệu

## Mục tiêu
Tính toán thống kê (Trung bình, Min, Median, Max, Tỷ lệ phần trăm) số lượng tài nguyên ("KC") cần thiết để đạt mốc 180 huy hiệu bằng phương pháp mô phỏng Monte Carlo.

## Logic Mô phỏng

### Một lượt quay (10 items)
Mỗi lượt bao gồm 10 phần tử:
1.  **Phần cố định**: 6 phần tử luôn là 1 huy hiệu. (Tổng: 6 huy hiệu)
2.  **Phần biến động**: 4 phần tử còn lại, mỗi phần tử nhận giá trị từ `{1, 2, 3, 5, 10}` với xác suất tương ứng `{70%, 15%, 10%, 4%, 1%}`.

### Ràng buộc (Kiểm tra & Re-roll)
Đối với 4 phần tử biến động, áp dụng các ràng buộc sau (nếu vi phạm thì quay lại cả 4 ô):
1.  Số lần ra `10` ≤ 2.
2.  Số lần ra `5` ≤ 2.
3.  Nếu có 2 lần ra `10` → số lần ra `5` ≤ 1.
4.  Không được phép ra bộ `[3, 3, 3, 3]`.

### Chiến thuật Tối ưu (Quay lẻ cuối game)
Khi số huy hiệu còn thiếu để đạt 180 là `remaining < 6`:
-   Dừng quay 10 (Batch).
-   Chuyển sang **Quay lẻ (Single Pull)**.
-   **Chi phí**: 19 KC / 1 lần quay.
-   **Phân phối xác suất Quay lẻ** (Giả định dựa trên trung bình của quay 10):
    -   60% tỉ lệ ra: 1 huy hiệu (tương đương phần cố định).
    -   40% tỉ lệ ra: Theo phân phối biến động `{1, 2, 3, 5, 10}` (Không áp dụng ràng buộc batch).
    -   *Tổng hợp xác suất Quay lẻ*:
        -   1 huy hiệu: 60% + (40% * 70%) = 88%
        -   2 huy hiệu: 40% * 15% = 6%
        -   3 huy hiệu: 40% * 10% = 4%
        -   5 huy hiệu: 40% * 4% = 1.6%
        -   10 huy hiệu: 40% * 1% = 0.4%

### Chỉ số đầu ra
-   **Mục tiêu**: Đạt 180 huy hiệu.
-   **Đơn vị đo**: "KC".
    -   Quay 10: Lần đầu **89 KC**, các lần sau **179 KC**.
    -   Quay lẻ: Lần đầu **9 KC**, các lần sau **19 KC**.
    -   *Logic tính chi phí*: Hệ thống sẽ theo dõi số lần đã quay của từng loại để áp dụng giá đúng.

## Các file dự kiến

### [simulation.py](file:///d:/Antigravity/simulation.py)
-   Sử dụng Python 3 (thư viện `random`).
-   `calculate_cost(batch_count, single_count)`: Hàm tính tổng KC.
-   `simulate_batch()`: Trả về số huy hiệu kiếm được trong một lượt hợp lệ.
-   `simulate_single()`: Trả về số huy hiệu kiếm được trong một lần quay lẻ.
-   `run_simulation()`: Chạy liên tục các lượt cho đến khi đạt mục tiêu 180 huy hiệu.
-   `main()`: Chạy `N=100,000` lần giả lập và in ra các thống kê.

## Kiểm thử
### Tự động
-   Chạy script và kiểm tra tính hợp lý của kết quả.
-   Xác minh các ràng buộc logic bằng log debug (tạm thời).
