import { ROLE_PLAYER, authGuard, signAccessToken } from "../services/authService.js";
import { getFacebookFriends, verifySignedPlayerInfo } from "../services/facebookService.js";
import { ensureFacebookPlayer, findUserById } from "../services/facebookAuthService.js";

export function createFacebookController(db) {
  async function instantAuth(req, res) {
    const signedPlayerInfo = req.body?.signed_player_info;
    if (!signedPlayerInfo) return res.status(400).json({ error: "signed_player_info is required" });

    try {
      const payload = verifySignedPlayerInfo(signedPlayerInfo);
      const fbPlayerId = String(payload.player_id || "").trim();
      if (!fbPlayerId) return res.status(400).json({ error: "invalid signed payload: missing player_id" });

      const player = await ensureFacebookPlayer(db, fbPlayerId);
      const user = await findUserById(db, player.user_id);
      const token = signAccessToken(user);
      return res.json({ token, player });
    } catch (error) {
      return res.status(401).json({ error: error.message || "facebook auth failed" });
    }
  }

  async function friends(req, res) {
    const accessToken = String(req.query.accessToken || "");
    if (!accessToken) return res.status(400).json({ error: "accessToken query parameter is required" });

    try {
      const data = await getFacebookFriends(accessToken);
      return res.json(data);
    } catch (error) {
      return res.status(400).json({ error: error.message || "failed to fetch friends" });
    }
  }

  return {
    instantAuth,
    friends,
    playerGuard: authGuard(ROLE_PLAYER),
  };
}
