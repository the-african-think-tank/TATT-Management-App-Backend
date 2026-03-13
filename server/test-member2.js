const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:dohtech1@localhost:5432/tatt_db');

const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, primaryKey: true },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    profilePicture: DataTypes.STRING,
    professionTitle: DataTypes.STRING,
    companyName: DataTypes.STRING,
    location: DataTypes.STRING,
    tattMemberId: DataTypes.STRING,
    communityTier: DataTypes.STRING,
    industry: DataTypes.STRING,
    chapterId: DataTypes.UUID,
    professionalHighlight: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN
}, { tableName: 'users', paranoid: true });

(async () => {
    try {
        const id = '25c36e6f-4fe7-4559-9283-a7202ac91f74';
        const member = await User.findByPk(id, {
            attributes: [
                'id', 'firstName', 'lastName', 'profilePicture', 'professionTitle',
                'companyName', 'location', 'tattMemberId', 'communityTier', 'industry',
                'chapterId', 'professionalHighlight',
            ]
        });
        console.log("Member result:", JSON.stringify(member));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
})();
