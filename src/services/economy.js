const UserCurrency = require("../models/UserCurrency.js");

class EconomySystem {
  async getUser(userId) {
    let user = await UserCurrency.findOne({ userId });

    if (!user) {
      user = new UserCurrency({
        userId,
        balance: 0,
      });
      await user.save();
    }
    return user;
  }

  async getBalance(settings) {
    try {
      const user = await this.getUser(settings.userId);

      return {
        error: false,
        type: "success",
        balance: user.balance,
      };
    } catch (error) {
      console.error("❌ Error interno:", error);
      return {
        error: true,
        type: "database-error",
      };
    }
  }

  async addBalance(settings) {
    await this.getUser(settings.userId);

    const amount = parseInt(settings.amount) || 0;

    if (amount <= 0) {
      return {
        error: true,
        type: "invalid-amount",
      };
    }

    try {
      await UserCurrency.findOneAndUpdate(
        { userId: settings.userId },
        { $inc: { balance: amount } },
        { new: true }
      );

      return {
        error: false,
        type: "success",
      };
    } catch (error) {
      console.error("❌ Error interno:", error);
      return {
        error: true,
        type: "database-error",
      };
    }
  }

  async removeBalance(settings) {
    const user = await this.getUser(settings.userId);

    const amount = parseInt(settings.amount) || 0;

    if (amount <= 0) {
      return {
        error: true,
        type: "invalid-amount",
      };
    }

    try {
      const updatedUser = await UserCurrency.findOneAndUpdate(
        { userId: settings.userId, balance: { $gte: amount } },
        { $inc: { balance: -amount } },
        { new: true }
      );

      if (!updatedUser) {
        return {
          error: true,
          type: "low-money",
          balance: user.balance,
        };
      }

      return {
        error: false,
        type: "success",
      };
    } catch (error) {
      console.error("❌ Error interno:", error);
      return {
        error: true,
        type: "database-error",
      };
    }
  }

  async payBalance(settings) {
    const { userSenderId, userReceiverId } = settings;
    const amount = parseInt(settings.amount) || 0;

    if (amount <= 0) {
      return {
        error: true,
        type: "invalid-amount",
      };
    }

    if (userSenderId === userReceiverId) {
      return {
        error: true,
        type: "same-user",
      };
    }

    const userSender = await this.getUser(userSenderId);
    await this.getUser(userReceiverId);

    if (userSender.balance < amount) {
      return {
        error: true,
        type: "low-money",
        balance: userSender.balance,
      };
    }

    try {
      const removeResult = await this.removeBalance({
        userId: userSenderId,
        amount: amount,
      });

      if (removeResult.error) return removeResult;

      const addResult = await this.addBalance({
        userId: userReceiverId,
        amount: amount,
      });

      if (addResult.error) {
        await this.addBalance({
          userId: userSenderId,
          amount: amount,
        });

        return addResult;
      }

      return {
        error: false,
        type: "success",
      };
    } catch (error) {
      console.error("Error interno:", error);
      return {
        error: true,
        type: "database-error",
      };
    }
  }
}

module.exports = EconomySystem;
