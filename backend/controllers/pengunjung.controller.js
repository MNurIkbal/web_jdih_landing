const pengunjungService = require("../services/pengunjung.service");

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return String(forwarded).split(",")[0].trim();
  return req.socket?.remoteAddress || "";
};

// Public: catat kunjungan / heartbeat pengunjung
const track = async (req, res) => {
  try {
    const visitorId = String(req.body?.visitor_id || "").trim();

    if (!visitorId || visitorId.length > 100) {
      return res.status(400).json({
        success: false,
        message: "visitor_id tidak valid",
      });
    }

    await pengunjungService.track({
      visitor_id: visitorId,
      ip_address: getClientIp(req),
      user_agent: req.headers["user-agent"] || "",
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mencatat kunjungan",
      error: error.message,
    });
  }
};

// Public: statistik pengunjung untuk footer
const getStatistik = async (req, res) => {
  try {
    const data = await pengunjungService.getStatistik();
    return res.status(200).json({
      success: true,
      message: "Statistik pengunjung berhasil diambil",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil statistik pengunjung",
      error: error.message,
    });
  }
};

module.exports = {
  track,
  getStatistik,
};
