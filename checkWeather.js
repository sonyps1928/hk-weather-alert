const fetch = require('node-fetch');

async function checkWarning() {
  try {
    const res = await fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en');
    if (!res.ok) throw new Error('Failed to fetch weather data');
    
    const data = await res.json();
    const warnings = [];
    
    if (data.WL) {
      warnings.push(data.WL.name);
    }
    if (data.WTS) {
      warnings.push(data.WTS.name);
    }

    return warnings.length > 0 ? warnings.join(', ') : null;
  } catch (error) {
    console.error('Error checking warnings:', error);
    return null;
  }
}

async function sendSlackNotification(message) {
  try {
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SLACKTOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: 'YOURCHANNELID', // Replace with actual channel ID
        text: `⚠️ Weather Warning: ${message}`
      }),
    });

    const result = await res.json();
    if (!result.ok) {
      throw new Error(`Slack API error: ${result.error}`);
    }
    return result;
  } catch (error) {
    console.error('Error sending Slack notification:', error);
  }
}

(async () => {
  const warnings = await checkWarning();
  if (warnings) {
    await sendSlackNotification(warnings);
  }
})();