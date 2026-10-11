import { NextRequest, NextResponse } from "next/server";
import { getCustomers } from "@/packages/modules/customers/customerService";
import {
  getAgingSummary,
  filterByAgingBucket,
  filterByCustomerGroup,
  type AgingBucket4,
} from "@/packages/modules/finance/agingService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const group = (searchParams.get("group") || "all") as "dai_ly" | "quan_an" | "chanh_xe" | "all";
    const bucket = searchParams.get("bucket") as AgingBucket4 | null;

    // Lấy toàn bộ khách hàng
    let customers = getCustomers();

    // Lọc theo nhóm
    customers = filterByCustomerGroup(customers, group);

    // Lọc theo bucket (nếu có)
    if (bucket) {
      customers = filterByAgingBucket(customers, bucket);
    }

    // Tính tổng hợp
    const summary = getAgingSummary(customers);

    return NextResponse.json({
      success: true,
      summary,
      count: customers.length,
      customers,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi lấy báo cáo tuổi nợ";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
