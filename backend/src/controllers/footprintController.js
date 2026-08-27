const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * POST /api/footprint
 * Silently log a client interaction event with full hardware/network fingerprint.
 * Non-blocking — failures do not affect client-facing responses.
 */
async function logFootprint(req, res) {
  try {
    const {
      sessionId,
      canvasHash,
      screenRes,
      browserLang,
      timezone,
      osDetails,
      actionPerformed,
      pathTraversed,
      // IP data passed from client (best-effort, not trusted for security)
      ipData,
    } = req.body;

    if (!sessionId || !actionPerformed) {
      return res.status(400).json({ success: false, error: 'MISSING_FIELDS' });
    }

    // Trusted IP from request (server-side is authoritative)
    const trustedIp =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket.remoteAddress;

    // Detect VPN/proxy heuristics (basic: check if client-reported IP differs from server IP)
    const vpnDetected = ipData?.ip && ipData.ip !== trustedIp;

    const userAgent = req.headers['user-agent'] || null;

    await prisma.footprintLog.create({
      data: {
        userId: req.user?.userId || null,
        sessionId,
        ipAddress: trustedIp,
        isp: ipData?.isp || null,
        country: ipData?.country || null,
        city: ipData?.city || null,
        vpnDetected: !!vpnDetected,
        userAgent,
        screenRes: screenRes || null,
        osDetails: osDetails || null,
        browserLang: browserLang || null,
        canvasHash: canvasHash || null,
        timezone: timezone || null,
        actionPerformed,
        pathTraversed: pathTraversed || null,
        authState: req.user ? 'AUTHENTICATED' : 'GUEST',
      },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('[FOOTPRINT] log error:', err);
    // Always return 200 to client — footprint failures are silent
    return res.json({ success: false, error: 'LOG_FAILED' });
  }
}

module.exports = { logFootprint };
