class UserInfoRepository {
    constructor(UserInfoModel) {
      this.UserInfo = UserInfoModel;
    }

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
  
  export default UserInfoRepository;