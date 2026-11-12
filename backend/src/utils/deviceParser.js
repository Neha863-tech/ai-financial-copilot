/**
 * FinSight AI - Device and User-Agent Parser
 * Extracts device type, browser, operating system, and approximate location.
 */

export function parseUserAgent(userAgentString = '') {
  const ua = userAgentString || '';
  
  // Detect Browser
  let browser = 'Unknown Browser';
  if (/Edg\/([0-9.]+)/.test(ua)) {
    browser = `Edge ${RegExp.$1.split('.')[0]}`;
  } else if (/Chrome\/([0-9.]+)/.test(ua)) {
    browser = `Chrome ${RegExp.$1.split('.')[0]}`;
  } else if (/Safari\/([0-9.]+)/.test(ua) && !/Chrome/.test(ua)) {
    browser = `Safari ${RegExp.$1.split('.')[0]}`;
  } else if (/Firefox\/([0-9.]+)/.test(ua)) {
    browser = `Firefox ${RegExp.$1.split('.')[0]}`;
  } else if (/MSIE|Trident/.test(ua)) {
    browser = 'Internet Explorer';
  } else if (/curl|Postman|node-fetch|axios/i.test(ua)) {
    browser = ua.split('/')[0] || 'API Client';
  }

  // Detect Operating System
  let operatingSystem = 'Unknown OS';
  if (/Windows NT 10.0/.test(ua)) {
    operatingSystem = 'Windows 11 / 10';
  } else if (/Windows NT 6.3/.test(ua)) {
    operatingSystem = 'Windows 8.1';
  } else if (/Windows NT 6.1/.test(ua)) {
    operatingSystem = 'Windows 7';
  } else if (/Macintosh|Mac OS X ([0-9_]+)/.test(ua)) {
    const ver = RegExp.$1 ? RegExp.$1.replace(/_/g, '.') : '';
    operatingSystem = ver ? `macOS ${ver}` : 'macOS';
  } else if (/iPhone OS ([0-9_]+)/.test(ua)) {
    operatingSystem = `iOS ${RegExp.$1.replace(/_/g, '.')}`;
  } else if (/iPad/.test(ua)) {
    operatingSystem = 'iPadOS';
  } else if (/Android ([0-9.]+)/.test(ua)) {
    operatingSystem = `Android ${RegExp.$1}`;
  } else if (/Linux/.test(ua)) {
    operatingSystem = 'Linux';
  }

  // Detect Device
  let deviceName = 'Desktop Workstation';
  if (/iPhone/.test(ua)) {
    deviceName = 'Apple iPhone';
  } else if (/iPad/.test(ua)) {
    deviceName = 'Apple iPad';
  } else if (/Android/.test(ua) && /Mobile/.test(ua)) {
    deviceName = 'Android Smartphone';
  } else if (/Android/.test(ua)) {
    deviceName = 'Android Tablet';
  } else if (/Macintosh/.test(ua)) {
    deviceName = 'Apple MacBook / Mac';
  } else if (/Windows/.test(ua)) {
    deviceName = 'Windows PC';
  }

  return {
    browser,
    operatingSystem,
    deviceName,
  };
}

/**
 * Extracts and normalizes client IP address from request headers.
 */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = forwarded.split(',').map((ip) => ip.trim());
    return ips[0];
  }
  const rawIp = req.socket?.remoteAddress || req.ip || '127.0.0.1';
  if (rawIp === '::1' || rawIp === '::ffff:127.0.0.1') {
    return '127.0.0.1';
  }
  return rawIp;
}

/**
 * Derives approximate location from IP address.
 * For local / private network IPs, defaults to configured demo developer location.
 */
export function getApproximateLocation(ip) {
  if (!ip || ip === '127.0.0.1' || ip === 'localhost' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return 'Bengaluru, India (Local)';
  }
  if (ip.startsWith('103.') || ip.startsWith('49.') || ip.startsWith('182.')) {
    return 'Mumbai, India';
  }
  if (ip.startsWith('122.') || ip.startsWith('157.')) {
    return 'New Delhi, India';
  }
  return 'San Jose, California, US';
}
