const CHANNEL_HANDLE = '@MirabiliumOfficial';
const endpoint = 'https://www.googleapis.com/youtube/v3';
const cacheHeaders = { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' };
async function getJson(url) { const response = await fetch(url, { signal: AbortSignal.timeout(8000) }); if (!response.ok) throw new Error(`YouTube API ${response.status}`); return response.json(); }
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return res.status(503).json({ error: 'YouTube API key is not configured' });
  try {
    const channelUrl = new URL(`${endpoint}/channels`);
    channelUrl.search = new URLSearchParams({ part: 'snippet,statistics,contentDetails', forHandle: CHANNEL_HANDLE, key }).toString();
    const channel = (await getJson(channelUrl)).items?.[0];
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    const playlistId = channel.contentDetails?.relatedPlaylists?.uploads;
    let videos = [];
    if (playlistId) {
      const uploadsUrl = new URL(`${endpoint}/playlistItems`);
      uploadsUrl.search = new URLSearchParams({ part: 'snippet', playlistId, maxResults: '6', key }).toString();
      const uploads = await getJson(uploadsUrl);
      videos = (uploads.items || []).filter(item => item.snippet?.resourceId?.videoId && item.snippet?.title !== 'Private video' && item.snippet?.title !== 'Deleted video').map(item => ({ id: item.snippet.resourceId.videoId, title: item.snippet.title, publishedAt: item.snippet.publishedAt, thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || null }));
    }
    res.setHeader('Cache-Control', cacheHeaders['Cache-Control']);
    return res.status(200).json({ subscribers: channel.statistics?.hiddenSubscriberCount ? null : Number(channel.statistics?.subscriberCount), videoCount: Number(channel.statistics?.videoCount), views: Number(channel.statistics?.viewCount), videos, fetchedAt: new Date().toISOString() });
  } catch (error) { console.error('Channel fetch failed:', error); return res.status(502).json({ error: 'Channel data is temporarily unavailable' }); }
}
