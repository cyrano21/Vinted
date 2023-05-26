const User = require("../models/User");

const isAuthentificated = async (req, res, next) => {
  const token = req.headers.authorization.replace("Bearer ", "");

  // console.log(token);

  const user = await User.findOne({ token: token }).select("account _id");

  console.log("user", user);
  // console.log(token);

  if (user) {
    req.user = user;
    return next();
  } else {
    return res.status(401).json("Unauthorized");
  }
};

module.exports = isAuthentificated;

//   if (!user) {
//     return res.status(401).json({ error: "Unauthorized" });
//   } else {
//     req.user = user;
//     // On crée une clé "user" dans req. La route dans laquelle le middleware est appelé     pourra avoir accès à req.user
//     return next();
//   }
//  else {
//   return res.status(401).json({ error: "Unauthorized" });
// }
