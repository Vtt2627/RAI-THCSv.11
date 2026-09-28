const questions = [
    {
        id: "C01",
        behavior: "HV01",
        question: "Minh nhận được một định lý lạ từ AI. Minh nên làm gì?",
        options: [
            "Dùng ngay kết quả AI đưa ra",
            "Kiểm tra lại bằng SGK hoặc nguồn đáng tin cậy",
            "Hỏi bạn bè rồi sử dụng",
            "Bỏ qua câu hỏi"
        ],
        answer: 1
    },
    {
        id: "C02",
        behavior: "HV02",
        question: "Hùng dùng AI để giải bài tập Vật lí và muốn nộp ngay kết quả. Hùng nên làm gì?",
        options: [
            "Nộp ngay vì AI đã giải",
            "Đọc, kiểm tra cách giải và chịu trách nhiệm về bài làm",
            "Chỉ sửa lỗi chính tả",
            "Gửi cho bạn khác làm tiếp"
        ],
        answer: 1
    },
    {
        id: "C03",
        behavior: "HV03",
        question: "Chi dùng AI để tìm ý tưởng và bố cục cho bài dự án. Chi nên làm gì?",
        options: [
            "Ghi nhận việc sử dụng AI theo yêu cầu",
            "Không cần nói vì bài do mình trình bày",
            "Xóa mọi dấu vết sử dụng AI",
            "Nói rằng toàn bộ nội dung do mình tự làm"
        ],
        answer: 0
    },
    {
        id: "C04",
        behavior: "HV04",
        question: "Các bạn muốn đưa tên và số điện thoại của cả lớp vào AI để tạo sổ địa chỉ. Cách nào phù hợp?",
        options: [
            "Đưa toàn bộ thông tin vào AI",
            "Gửi thông tin trước rồi hỏi sau",
            "Xem xét sự cần thiết và hạn chế đưa thông tin cá nhân không cần thiết",
            "Đăng thông tin lên mạng để AI dễ xử lí"
        ],
        answer: 2
    },
    {
        id: "C05",
        behavior: "HV05",
        question: "Duy nhận được một đoạn ghi âm của bạn đề nghị chuyển tiền gấp. Đoạn ghi âm có một số điểm bất thường. Duy nên làm gì?",
        options: [
            "Chuyển tiền ngay, không nghĩ ngợi",
            "Tin vì đó là giọng của bạn và chuyển ngay",
            "Chia sẻ đoạn ghi âm cho mọi người",
            "Kiểm tra lại thông tin bằng cách phù hợp"
        ],
        answer: 3
    },
    {
        id: "C06",
        behavior: "HV06",
        question: "AI cung cấp thông tin về một dự án công nghệ nhưng nguồn chỉ ghi là một chuyên gia công nghệ không rõ danh tính. Em nên làm gì?",
        options: [
            "Tìm, đối chiếu với nguồn tin cậy",
            "Chỉ cần xem nhiều lần câu trả lời",
            "Tin ngay vì AI đã trả lời, không cần kiểm tra lại",
            "Sử dụng ngay trong bài dự án"
        ],
        answer: 0
    },
    {
        id: "C07",
        behavior: "HV07",
        question: "Một tài khoản lạ thông báo em trúng thưởng và gửi một đường link yêu cầu cung cấp thông tin. Em nên làm gì?",
        options: [
            "Nhấn vào link để kiểm tra",
            "Cung cấp thông tin cá nhân để nhận thưởng",
            "Chuyển tiếp cho bạn bè",
            "Bảo mật thông tin, báo cáo link giả"
        ],
        answer: 2
    },
    {
        id: "C08",
        behavior: "HV08",
        question: "Nam giao toàn bộ việc lập dàn ý và tìm ý tưởng cho bài học cho AI. Cách sử dụng phù hợp hơn là gì?",
        options: [
            "Để AI quyết định toàn bộ",
            "Dùng AI để tham khảo rồi tự lựa chọn, điều chỉnh và phát triển ý tưởng",
            "Sao chép toàn bộ nội dung AI tạo ra",
            "Không cần kiểm tra nội dung"
        ],
        answer: 1
    },
    {
        id: "C09",
        behavior: "HV09",
        question: "Một học sinh nhận bản dịch do AI tạo ra và muốn sử dụng ngay trong bài dự thi. Em nên làm gì?",
        options: [
            "Kiểm tra ngữ pháp, ý nghĩa và ngữ cảnh rồi điều chỉnh nếu cần",
            "Chỉ kiểm tra độ dài",
            "Dùng ngay vì AI dịch nhanh và sửa dụng luôn",
            "Không cần đọc lại"
        ],
        answer: 0
    }
];

const behaviors = {
    HV01: "Kiểm tra và đánh giá thông tin do AI cung cấp",
    HV02: "Kiểm tra kết quả do AI hỗ trợ",
    HV03: "Ghi nhận việc sử dụng AI khi cần thiết",
    HV04: "Bảo vệ thông tin cá nhân khi sử dụng AI",
    HV05: "Nhận biết nội dung có thể do AI tạo ra hoặc bị giả mạo",
    HV06: "Xác minh thông tin AI bằng nguồn phù hợp",
    HV07: "Xử lí phù hợp khi gặp nội dung đáng ngờ",
    HV08: "Giữ vai trò chủ động của con người khi sử dụng AI",
    HV09: "Kiểm tra sản phẩm do AI hỗ trợ"
};

const recommendations = {
    HV01: "Kiểm tra thông tin AI bằng SGK hoặc nguồn đáng tin cậy trước khi sử dụng.",
    HV02: "Đọc, kiểm tra cách giải và chịu trách nhiệm về kết quả cuối cùng.",
    HV03: "Ghi nhận việc sử dụng AI theo yêu cầu của giáo viên hoặc quy định của hoạt động.",
    HV04: "Không đưa thông tin cá nhân không cần thiết vào công cụ AI.",
    HV05: "Chú ý các dấu hiệu bất thường và kiểm tra lại trước khi tin hoặc chia sẻ.",
    HV06: "Tìm và đối chiếu thông tin AI với các nguồn đáng tin cậy.",
    HV07: "Không nhấn liên kết hoặc cung cấp thông tin khi chưa xác minh; báo người có trách nhiệm khi cần.",
    HV08: "Dùng AI để tham khảo, sau đó tự lựa chọn, điều chỉnh và phát triển nội dung.",
    HV09: "Kiểm tra ngữ pháp, ý nghĩa, nội dung và ngữ cảnh trước khi sử dụng."
};