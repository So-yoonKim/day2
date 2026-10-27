// Vercel 서버리스 함수: API 키는 환경변수 PIXABAY_API_KEY 에서만 읽는다 (브라우저로 노출되지 않음)
module.exports = async (req, res) => {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) {
    return res.status(500).json({ error: '서버에 PIXABAY_API_KEY 환경변수가 설정되지 않았습니다.' });
  }

  const q = String(req.query.q || '').trim().slice(0, 100);
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  if (!q) {
    return res.status(400).json({ error: '검색어를 입력하세요.' });
  }

  const url = 'https://pixabay.com/api/?' + new URLSearchParams({
    key, q, image_type: 'photo', per_page: '10', page: String(page), lang: 'ko'
  });

  try {
    const r = await fetch(url);
    if (!r.ok) {
      return res.status(r.status).json({ error: 'Pixabay 요청 실패 (' + r.status + ')' });
    }
    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json({
      hits: data.hits.map(h => ({ url: h.webformatURL, tags: h.tags }))
    });
  } catch (e) {
    return res.status(502).json({ error: 'Pixabay에 연결하지 못했습니다.' });
  }
};
