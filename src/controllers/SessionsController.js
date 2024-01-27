const UserRepository = require("../repositories/UserRepository");
const SessionCreateService = require("../services/SessionCreateService");

class SessionsController {
  async create(request, response) {
    const { email, password } = request.body;

    const userRepository = new UserRepository();
    const sessionCreateService = new SessionCreateService(userRepository);
    try {
      const { token, user } = await sessionCreateService.execute({
        email,
        password,
      });
      return response.json({ token, user });
    } catch (error) {
      return response
        .status(error.statusCode || 500)
        .json({ error: error.message });
    }
  }
}

module.exports = SessionsController;
