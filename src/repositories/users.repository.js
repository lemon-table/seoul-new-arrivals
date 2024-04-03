class UsersRepository {
    constructor(UserModel,UserInfoModel) {
      this.User = UserModel;
      this.UserInfo = UserInfoModel;
    }
  
    createUser = async (email, username, hashedPassword) => {
      try {
        const user = await this.User.create({
          email,
          username,
          password: hashedPassword
        });
        return user;
      } catch (error) {
        throw error;
      }
    };
  
    findUser = async (email) => {
      try {
        const user = await this.User.findOne({ where: { email } });
        return user;
      } catch (error) {
        throw error;
      }
    };

    updateUser = async (userId, nickname) => {
    const updatedUser = await this.User.update(
        { nickname },
        { where: { id: userId } }
    );

    return updatedUser;
    };


    createUserInfo = async (userId, gender, name, age) => {
        const createUserInfo = await this.UserInfo.create({
          data: {
            userId: userId,
            gender,
            name,
            age: Number(age)
          }
        });
    
        return createUserInfo;
      };

    readUserInfo = async (userId) => {
    const user = await this.UserInfo.findOne({
        where: { userId },
        include: [{ model: this.User, as: 'user', attributes: ['nickname', 'email'] }]
        });

        return user;
    };

    updateUserInfo = async (userId, name, age, gender, profileImage) => {
    const updatedUserInfo = await this.UserInfo.update(
            { name, age, gender, profileImage },
            { where: { userId } }
        );
    
        return updatedUserInfo;
    };

  }
  
  export default UsersRepository;