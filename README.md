# DocuHTML

Aplikasi web untuk mengonversi file DOCX menjadi HTML langsung di browser. Dokumen tidak diunggah ke server.

## Menjalankan

```bash
npm install
npm run dev
```

Untuk membuat versi produksi:

```bash
npm run build
npm run preview
```

## Fitur versi pertama

- Drag-and-drop atau pilih file DOCX
- Konversi heading, paragraf, list, tabel, link, dan gambar
- Preview dan editor HTML berdampingan
- Salin HTML atau unduh file HTML lengkap
- Validasi format dan batas ukuran 20 MB
- Pemrosesan lokal di browser

## Catatan

DOCX adalah format dokumen, bukan format layout web. Elemen Word yang kompleks seperti floating shapes, SmartArt, text box, atau layout halaman presisi dapat disederhanakan saat dikonversi.

## GitHub Pages

Project dikonfigurasi untuk repository `nofariawan/doc-to-html`. Push ke branch `main`, lalu pilih **Settings → Pages → Source: GitHub Actions**. Setelah workflow selesai, aplikasi tersedia di:

`https://nofariawan.github.io/doc-to-html/`

Folder `output/` diabaikan oleh Git agar dokumen yang dikonversi tidak terpublikasi.
