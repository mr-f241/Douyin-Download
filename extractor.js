// extractor.js — injected into the Douyin tab on demand
if (!window.__douyinExtractorLoaded) {
  window.__douyinExtractorLoaded = true;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const fetchPage = async (sec_user_id, max_cursor) => {
    const url =
      `https://www.douyin.com/aweme/v1/web/aweme/post/` +
      `?device_platform=webapp&aid=6383&channel=channel_pc_web` +
      `&sec_user_id=${encodeURIComponent(sec_user_id)}` +
      `&max_cursor=${max_cursor}&count=20` +
      `&version_code=170400&version_name=17.4.0`;

    const res = await fetch(url, {
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'vi',
        'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="118", "Microsoft Edge";v="118"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.0.0',
      },
      referrer: `https://www.douyin.com/user/${sec_user_id}`,
      referrerPolicy: 'strict-origin-when-cross-origin',
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  const parseVideo = (item) => {
    // Video URL
    let url =
      item?.video?.play_addr?.url_list?.[0] ||
      item?.video?.download_addr?.url_list?.[0] ||
      null;
    if (url && !url.startsWith('https')) url = url.replace('http', 'https');

    // Thumbnail
    let thumb =
      item?.video?.cover?.url_list?.[0] ||
      item?.video?.dynamic_cover?.url_list?.[0] ||
      null;
    if (thumb && !thumb.startsWith('https')) thumb = thumb.replace('http', 'https');

    // Description / title
    const desc = item?.desc || '';

    // aweme_id for filename
    const id = item?.aweme_id || Date.now().toString();

    return url ? { url, thumb, desc, id } : null;
  };

  const run = async () => {
    const sec_user_id = location.pathname.replace('/user/', '').split('?')[0];
    if (!sec_user_id || !location.pathname.includes('/user/')) {
      chrome.runtime.sendMessage({ type: 'ERROR', message: 'Not on a Douyin user profile page.' });
      return;
    }

    const videos = [];
    let hasMore = 1;
    let max_cursor = 0;
    let errorCount = 0;

    while (hasMore === 1 && errorCount < 5) {
      try {
        const data = await fetchPage(sec_user_id, max_cursor);

        if (!data?.aweme_list) {
          errorCount++;
          await sleep(3000);
          continue;
        }

        errorCount = 0;
        hasMore = data.has_more;
        max_cursor = data.max_cursor;

        for (const item of data.aweme_list) {
          const v = parseVideo(item);
          if (v) videos.push(v);
        }

        chrome.runtime.sendMessage({ type: 'PROGRESS', count: videos.length, videos: [...videos] });
        await sleep(1000);
      } catch (e) {
        chrome.runtime.sendMessage({ type: 'ERROR', message: e.message });
        errorCount++;
        await sleep(3000);
      }
    }

    chrome.runtime.sendMessage({ type: 'DONE', count: videos.length, videos });
  };

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'START_EXTRACT') run();
  });
}
