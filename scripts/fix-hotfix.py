import pathlib, re

def fix_ui_web():
    p = pathlib.Path("Z:/SK Workspace 2/docs/ui-web.html")
    t = p.read_text(encoding='utf-8')
    # M3: remove mono from specific badges
    t = t.replace(
        '<span class="mono text-[11px] px-2 py-0.5 rounded-full border font-bold" style="background:var(--surface-2);border-color:var(--line)">#home Bento</span>',
        '<span class="text-[11px] px-2 py-0.5 rounded-full border font-bold" style="background:var(--surface-2);border-color:var(--line)">#home Bento</span>'
    )
    # KPI label mono -> normal
    t = t.replace(
        "'<div class=\"mono text-[11px] tracking-widest font-bold\" style=\"color:var(--muted)\">'+k.label.toUpperCase()+'</div>'",
        "'<div class=\"text-[11px] tracking-widest font-bold\" style=\"color:var(--muted)\">'+k.label.toUpperCase()+'</div>'"
    )
    # progress bar colors
    t = t.replace(
        "a.color==='violet'?'bg-violet-500':a.color==='orange'?'bg-orange-500':a.color==='emerald'",
        "a.color==='emerald'"
    )
    # group badge mono
    t = t.replace(
        '<span class="mono text-[11px] tracking-widest font-bold px-2 py-1 rounded-full border \'+map[a.color]+\'">',
        '<span class="text-[11px] tracking-widest font-bold px-2 py-1 rounded-full border \'+map[a.color]+\'">'
    )
    # filterRow mono
    t = t.replace(
        'class="mono text-xs px-3 py-1.5 rounded-full border font-bold"',
        'class="text-xs px-3 py-1.5 rounded-full border font-bold"'
    )
    # M2 63 cols
    cols63_block = """const MISA_COLS=[
  // Header 1-10
  {key:'ngay_ht',label:'Ngay HT'},{key:'ngay_ct',label:'Ngay CT'},{key:'so_ct',label:'So CT'},{key:'mst',label:'MST'},{key:'ten_kh',label:'Ten KH'},{key:'dia_chi',label:'Dia chi'},{key:'dien_giai',label:'Dien giai'},{key:'ma_kh',label:'Ma KH'},{key:'nhom_kh',label:'Nhom KH'},{key:'chi_nhanh',label:'Chi nhanh'},
  // Chi tiet 11-35
  {key:'ma_hang',label:'Ma hang'},{key:'ten_hang',label:'Ten hang'},{key:'dvt',label:'DVT'},{key:'so_luong',label:'SL'},{key:'don_gia',label:'Don gia'},{key:'thanh_tien',label:'Thanh tien'},{key:'thue_suat',label:'Thue suat'},{key:'tien_thue',label:'Tien thue'},{key:'tk_no',label:'TK No'},{key:'tk_co',label:'TK Co'},{key:'kho',label:'Kho'},{key:'so_lo',label:'So lo'},{key:'han_sd',label:'Han SD'},{key:'ck_ty_le',label:'CK %'},{key:'ck_tien',label:'Tien CK'},{key:'ngoai_te',label:'Ngoai te'},{key:'ty_gia',label:'Ty gia'},{key:'thanh_tien_qd',label:'Thanh tien QD'},{key:'tien_thue_qd',label:'Tien thue QD'},{key:'tk_no_qd',label:'TK No QD'},{key:'tk_co_qd',label:'TK Co QD'},{key:'ghi_chu_dong',label:'Ghi chu dong'},{key:'ma_ct_lq',label:'CT lien quan'},{key:'cp_dong',label:'CP dong'},{key:'phi_khac',label:'Phi khac'},
  // Tong hop 36-45
  {key:'tong_hang',label:'Tong tien hang'},{key:'tong_thue',label:'Tong thue'},{key:'tong_tt',label:'Tong TT'},{key:'tong_ck',label:'Tong CK'},{key:'tong_cp',label:'Tong CP'},{key:'hinh_thuc',label:'Hinh thuc TT'},{key:'han_tt',label:'Han TT'},{key:'ck_hd_ty_le',label:'CK HD %'},{key:'ck_hd_tien',label:'Tien CK HD'},{key:'con_phai_thu',label:'Con phai thu'},
  // Mo rong 46-63
  {key:'chiet_khau',label:'Chiet khau'},{key:'cp_vc',label:'CP van chuyen'},{key:'lo_han',label:'Lo/han'},{key:'ghi_chu',label:'Ghi chu'},{key:'nv_ban',label:'NV ban'},{key:'kenh',label:'Kenh'},{key:'ma_nv',label:'Ma NV'},{key:'bo_phan',label:'Bo phan'},{key:'du_an',label:'Du an'},{key:'hop_dong',label:'Hop dong'},{key:'ngay_giao',label:'Ngay giao'},{key:'dia_giao',label:'D/c giao'},{key:'ghi_chu_giao',label:'Ghi chu giao'},{key:'trang_thai',label:'Trang thai'},{key:'nguon',label:'Nguon'},{key:'external_id',label:'External ID'},{key:'last_synced',label:'Last synced'},{key:'tich_hop',label:'Tich hop'},
];"""
    # Need unicode labels - rewrite with proper Vietnamese
    cols63_block = cols63_block.replace("Ten KH","Tên KH").replace("Dia chi","Địa chỉ").replace("Dien giai","Diễn giải").replace("Ma KH","Mã KH").replace("Nhom KH","Nhóm KH").replace("Chi nhanh","Chi nhánh").replace("Ma hang","Mã hàng").replace("Ten hang","Tên hàng").replace("Don gia","Đơn giá").replace("Thanh tien","Thành tiền").replace("Thue suat","Thuế suất").replace("Tien thue","Tiền thuế").replace("So lo","Số lô").replace("Han SD","Hạn SD").replace("Tien CK","Tiền CK").replace("Ngoai te","Ngoại tệ").replace("Ty gia","Tỷ giá").replace("Tien thue QD","Tiền thuế QĐ").replace("Ghi chu dong","Ghi chú dòng").replace("CT lien quan","CT liên quan").replace("CP dong","CP dòng").replace("Phi khac","Phí khác").replace("Tong tien hang","Tổng tiền hàng").replace("Tong thue","Tổng thuế").replace("Tong TT","Tổng TT").replace("Tong CK","Tổng CK").replace("Tong CP","Tổng CP").replace("Hinh thuc TT","Hình thức TT").replace("Han TT","Hạn TT").replace("Tien CK HD","Tiền CK HĐ").replace("Con phai thu","Còn phải thu").replace("Chiet khau","Chiết khấu").replace("CP van chuyen","CP vận chuyển").replace("Ghi chu","Ghi chú").replace("Bo phan","Bộ phận").replace("Du an","Dự án").replace("Hop dong","Hợp đồng").replace("Ngay giao","Ngày giao").replace("D/c giao","Đ/c giao").replace("Ghi chu giao","Ghi chú giao").replace("Trang thai","Trạng thái").replace("Nguon","Nguồn")
    # fix double
    cols63_block = cols63_block.replace("Ngày HT","Ngày HT") # ok

    t = re.sub(r"const MISA_COLS=\[.*?\];\s*\nwhile\(MISA_COLS\.length<63\).*?\n", cols63_block + "\n", t, flags=re.DOTALL)
    t = t.replace(
        "const VISIBLE_DEFAULT=['so_ct','ngay_ht','mst','ten_kh','ma_hang','so_luong','don_gia','thanh_tien','thue_suat','tien_thue','tk_no','tk_co'];",
        "const VISIBLE_DEFAULT=['so_ct','ngay_ht','mst','ten_kh','ma_hang','so_luong','don_gia','thanh_tien','thue_suat','tien_thue','tk_no','tk_co']; // TODO GĐ2 @tanstack/react-virtual"
    )
    p.write_text(t, encoding='utf-8')
    print("ui-web fixed")

def fix_proto():
    p = pathlib.Path("Z:/SK Workspace 2/docs/sk-workspace-prototype-modern-utility.html")
    t = p.read_text(encoding='utf-8')
    t = t.replace('content="width=device-width, initial-scale=1.0">', 'content="width=device-width, initial-scale=1.0, viewport-fit=cover">')
    cols63 = "const MISA_COLS=[{key:'ngay_ht',label:'Ngày HT'},{key:'ngay_ct',label:'Ngày CT'},{key:'so_ct',label:'Số CT'},{key:'mst',label:'MST'},{key:'ten_kh',label:'Tên KH'},{key:'dia_chi',label:'Địa chỉ'},{key:'dien_giai',label:'Diễn giải'},{key:'ma_kh',label:'Mã KH'},{key:'nhom_kh',label:'Nhóm KH'},{key:'chi_nhanh',label:'Chi nhánh'},{key:'ma_hang',label:'Mã hàng'},{key:'ten_hang',label:'Tên hàng'},{key:'dvt',label:'ĐVT'},{key:'so_luong',label:'SL'},{key:'don_gia',label:'Đơn giá'},{key:'thanh_tien',label:'Thành tiền'},{key:'thue_suat',label:'Thuế suất'},{key:'tien_thue',label:'Tiền thuế'},{key:'tk_no',label:'TK Nợ'},{key:'tk_co',label:'TK Có'},{key:'kho',label:'Kho'},{key:'so_lo',label:'Số lô'},{key:'han_sd',label:'Hạn SD'},{key:'ck_ty_le',label:'CK %'},{key:'ck_tien',label:'Tiền CK'},{key:'ngoai_te',label:'Ngoại tệ'},{key:'ty_gia',label:'Tỷ giá'},{key:'thanh_tien_qd',label:'Thành tiền QĐ'},{key:'tien_thue_qd',label:'Tiền thuế QĐ'},{key:'tk_no_qd',label:'TK Nợ QĐ'},{key:'tk_co_qd',label:'TK Có QĐ'},{key:'ghi_chu_dong',label:'Ghi chú dòng'},{key:'ma_ct_lq',label:'CT liên quan'},{key:'cp_dong',label:'CP dòng'},{key:'phi_khac',label:'Phí khác'},{key:'tong_hang',label:'Tổng tiền hàng'},{key:'tong_thue',label:'Tổng thuế'},{key:'tong_tt',label:'Tổng TT'},{key:'tong_ck',label:'Tổng CK'},{key:'tong_cp',label:'Tổng CP'},{key:'hinh_thuc',label:'Hình thức TT'},{key:'han_tt',label:'Hạn TT'},{key:'ck_hd_ty_le',label:'CK HĐ %'},{key:'ck_hd_tien',label:'Tiền CK HĐ'},{key:'con_phai_thu',label:'Còn phải thu'},{key:'chiet_khau',label:'Chiết khấu'},{key:'cp_vc',label:'CP vận chuyển'},{key:'lo_han',label:'Lô/hạn'},{key:'ghi_chu',label:'Ghi chú'},{key:'nv_ban',label:'NV bán'},{key:'kenh',label:'Kênh'},{key:'ma_nv',label:'Mã NV'},{key:'bo_phan',label:'Bộ phận'},{key:'du_an',label:'Dự án'},{key:'hop_dong',label:'Hợp đồng'},{key:'ngay_giao',label:'Ngày giao'},{key:'dia_giao',label:'Đ/c giao'},{key:'ghi_chu_giao',label:'Ghi chú giao'},{key:'trang_thai',label:'Trạng thái'},{key:'nguon',label:'Nguồn'},{key:'external_id',label:'External ID'},{key:'last_synced',label:'Last synced'},{key:'tich_hop',label:'Tích hợp'}];"
    t = re.sub(r"const MISA_COLS=\[.*?\];\s*\nwhile\(MISA_COLS\.length<63\).*?\n", cols63 + "\n", t, flags=re.DOTALL)
    t = t.replace(
        "const VISIBLE_DEFAULT=['so_ct','ngay_ht','mst','ten_kh','ma_hang','so_luong','don_gia','thanh_tien','thue_suat','tien_thue','tk_no','tk_co'];",
        "const VISIBLE_DEFAULT=['so_ct','ngay_ht','mst','ten_kh','ma_hang','so_luong','don_gia','thanh_tien','thue_suat','tien_thue','tk_no','tk_co']; // TODO GĐ2 @tanstack/react-virtual"
    )
    p.write_text(t, encoding='utf-8')
    print("proto fixed")

fix_ui_web()
fix_proto()
