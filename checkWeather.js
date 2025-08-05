async function fetchWeather() {
  const fetch = (await import('node-fetch')).default; // Use dynamic import
  const res = await fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en');
  const data = await res.json();

  const warnings = [];
  if (data.WL) {
    warnings.push(data.WL.name);
  }
  if (data.WTS) {
    warnings.push(data.WTS.name);
  }

  return warnings.length > 0 ? warnings.join(', ') : null;
}

async function sendSlackNotification(message) {
  const fetch = (await import('node-fetch')).default; // Use dynamic import
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SLACKTOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: 'C099ELDUG3B', // Replace with actual channel ID
      text: `⚠️ Weather Warning: ${message}`
    }),
  });

  const result = await res.json();
  if (!result.ok) {
    throw new Error(`Slack API error: ${result.error}`);
  }
  return result;
}

(async () => {
  const warnings = await fetchWeather();
  if (warnings) {
    await sendSlackNotification(warnings);
  }
})();