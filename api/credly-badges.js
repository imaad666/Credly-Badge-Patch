export default async function handler(req, res) {
  const { username } = req.query;
  
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  try {
    const response = await fetch(`https://www.credly.com/users/${username}/badges.json`);
    const data = await response.json();
    
    const badges = data.data.badges
      .filter(b => b.visibility === 'public' && b.state === 'accepted')
      .map(({ id, name, image_url, issued_at, badge_template: { url } }) => ({
        id,
        name,
        image: image_url,
        issued: issued_at,
        url
      }))
      .sort((a, b) => new Date(b.issued) - new Date(a.issued));

    res.setHeader('Cache-Control', 's-maxage=3600');
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
}
