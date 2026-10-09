import { SapoOrder, CentralOrder } from "./types";

const MOCK_SAPO_ORDERS: SapoOrder[] = [
  {
    id: 100841,
    code: "SP-0841",
    created_on: "2026-10-08T08:30:00Z",
    customer: {
      id: 501,
      code: "KH-0001",
      name: "An Thịnh Mart (Q7)",
      address: "125 Nguyễn Thị Thập, P. Tân Phú, Q.7, TP.HCM",
      tax_number: "0301234567",
      phone: "0908112233"
    },
    branch_name: "Kho Q7",
    status: "completed",
    total_price: 3542400,
    note: "Giao trước 11h trưa - thùng xốp giữ lạnh",
    line_items: [
      {
        id: 1,
        product_id: 101,
        variant_id: 1001,
        sku: "HEO-XAY-500",
        product_name: "Thịt heo xay tươi 500g (Sơn Khang)",
        quantity: 40,
        price: 82000,
        tax_rate: 8,
        unit: "khay"
      }
    ]
  },
  {
    id: 100840,
    code: "SP-0840",
    created_on: "2026-10-08T09:15:00Z",
    customer: {
      id: 502,
      code: "KH-0002",
      name: "Minh Khang Food B2B",
      address: "48 Lê Văn Khương, P. Hiệp Thành, Q.12, TP.HCM",
      tax_number: "0312345678",
      phone: "0912334455"
    },
    branch_name: "Kho Q12",
    status: "completed",
    total_price: 3885000,
    note: "Đơn sỉ chuỗi bún bò",
    line_items: [
      {
        id: 2,
        product_id: 102,
        variant_id: 1002,
        sku: "BO-VIEN-1K",
        product_name: "Bò viên gân đặc biệt 1kg",
        quantity: 20,
        price: 185000,
        tax_rate: 5,
        unit: "gói"
      }
    ]
  },
  {
    id: 100839,
    code: "SP-0839",
    created_on: "2026-10-08T10:00:00Z",
    customer: {
      id: 503,
      code: "KH-0003",
      name: "Sài Gòn Fresh Mart",
      address: "210 Huỳnh Tấn Phát, Q.7, TP.HCM",
      tax_number: "", // Lỗi MST rỗng phục vụ kiểm tra kế toán
      phone: "0987654321"
    },
    branch_name: "Kho Q7",
    status: "completed",
    total_price: 2052000,
    note: "Khách lẻ yêu cầu xuất VAT sau",
    line_items: [
      {
        id: 3,
        product_id: 103,
        variant_id: 1003,
        sku: "CHA-LUA-500",
        product_name: "Chả lụa truyền thống 500g",
        quantity: 20,
        price: 95000,
        tax_rate: 8,
        unit: "cây"
      }
    ]
  },
  {
    id: 100838,
    code: "SP-0838",
    created_on: "2026-10-08T10:45:00Z",
    customer: {
      id: 504,
      code: "KH-0004",
      name: "Kho Sỉ Thực Phẩm Q7",
      address: "Lô C2 KCN Tân Thuận, Q.7, TP.HCM",
      tax_number: "0309990001",
      phone: "0933221100"
    },
    branch_name: "Kho Q12",
    status: "completed",
    total_price: 1584000,
    note: "Sản phẩm mới chưa map SKU",
    line_items: [
      {
        id: 4,
        product_id: 104,
        variant_id: 1004,
        sku: "UNKNOWN-SKU", // Cảnh báo SKU chưa map
        product_name: "Pate gan heo đặc biệt hộp 200g",
        quantity: 12,
        price: 120000,
        tax_rate: 10,
        unit: "hộp"
      }
    ]
  },
  {
    id: 100837,
    code: "SP-0837",
    created_on: "2026-10-08T11:20:00Z",
    customer: {
      id: 505,
      code: "KH-0005",
      name: "Nhà Hàng Cơm Niêu Quê Nhà",
      address: "52 Nguyễn Đình Chiểu, Q.3, TP.HCM",
      tax_number: "0305566778",
      phone: "0903445566"
    },
    branch_name: "Kho Q7",
    status: "completed",
    total_price: 5292000,
    note: "Đơn giao ca chiều",
    line_items: [
      {
        id: 5,
        product_id: 105,
        variant_id: 1005,
        sku: "BAROI-RUT-SUON",
        product_name: "Ba rọi heo rút sườn đông lạnh",
        quantity: 35,
        price: 140000,
        tax_rate: 8,
        unit: "kg"
      }
    ]
  },
  {
    id: 100836,
    code: "SP-0836",
    created_on: "2026-10-08T13:00:00Z",
    customer: {
      id: 506,
      code: "KH-0006",
      name: "Bếp Ăn Công Nghiệp Tân Bình",
      address: "18 KCN Tân Bình, P. Tây Thạnh, Q. Tân Phú",
      tax_number: "0307788990",
      phone: "0944556677"
    },
    branch_name: "Kho Q12",
    status: "completed",
    total_price: 4428000,
    note: "HĐĐT gửi qua email ke-toan@tanbinhfood.vn",
    line_items: [
      {
        id: 6,
        product_id: 101,
        variant_id: 1001,
        sku: "HEO-XAY-500",
        product_name: "Thịt heo xay tươi 500g (Sơn Khang)",
        quantity: 50,
        price: 82000,
        tax_rate: 8,
        unit: "khay"
      }
    ]
  }
];

export async function fetchSapoOrders(options?: {
  sinceDate?: string;
  limit?: number;
}): Promise<SapoOrder[]> {
  // Sapo API URL (nếu có cấu hình biến môi trường SAPO_API_URL & SAPO_API_KEY)
  const apiUrl = process.env.SAPO_API_URL;
  const apiKey = process.env.SAPO_API_KEY;

  if (apiUrl && apiKey) {
    try {
      const res = await fetch(`${apiUrl}/admin/orders.json?limit=${options?.limit || 50}`, {
        headers: {
          "X-Sapo-Access-Token": apiKey,
          "Content-Type": "application/json"
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.orders)) {
          return data.orders;
        }
      }
    } catch (err) {
      console.warn("[SAPO ADAPTER] Không thể kết nối live API Sapo, chuyển sang mock dataset:", err);
    }
  }

  // Fallback: Dataset mẫu nghiệp vụ thực tế của Cty Thực Phẩm Sơn Khang
  return MOCK_SAPO_ORDERS.slice(0, options?.limit || MOCK_SAPO_ORDERS.length);
}

export function normalizeToCentralOrders(sapoOrders: SapoOrder[]): CentralOrder[] {
  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  return sapoOrders.map((so) => {
    return {
      id: so.code, // external_id
      order_code: so.code,
      created_date: dateStr,
      accounting_date: dateStr,
      customer_code: so.customer.code || `KH-${so.customer.id}`,
      customer_name: so.customer.name,
      customer_tax_code: so.customer.tax_number || "",
      customer_address: so.customer.address || "TP. Hồ Chí Minh",
      branch: so.branch_name.includes("Q12") ? "Q12" : "Q7",
      items: so.line_items.map((li) => ({
        sku: li.sku,
        name: li.product_name,
        dvt: li.unit || "kg",
        quantity: li.quantity,
        price: li.price,
        tax_rate: `${li.tax_rate || 8}%`,
        lot_number: `L${so.code.replace("SP-", "")}`,
        expiry_date: "08/04/2027"
      })),
      total_amount: so.total_price,
      note: so.note || "Bán buôn thực phẩm Sơn Khang",
      source: "Sapo",
      last_synced_at: new Date().toISOString()
    };
  });
}
