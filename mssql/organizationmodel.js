const sequelize = require('sequelize');

const connection = new sequelize(config.db.database,config.db.username,config.db.password);

const Org = connection.define("Organization", {
    Id: sequelize.UUID,
    Name: sequelize.STRING,
    Alias: sequelize.STRING,
    ParentId: sequelize.UUID,
    OrganizationTypeId: sequelize.UUID,
    TimeZoneId: sequelize.UUID,
    ChannelPartnerId: sequelize.UUID,
    ForeignBillingCode: sequelize.STRING,
    ExternalOrganizationId: sequelize.STRING,
    RevspringOfficeId: sequelize.UUID,
    SiteName: sequelize.STRING,
    RedirectUrl: sequelize.STRING,
    Code: sequelize.STRING,
    AdministratorId: sequelize.STRING,
    BackupAdministratorId: sequelize.UUID,
    SchemaName: sequelize.UUID,
    Inactive: sequelize.STRING,
    CreatedAt: sequelize.DATE,
    CreatedBy: sequelize.UUID,
    UpdatedAt: sequelize.DATE,
    UpdatedBy: sequelize.UUID,
    InactiveAt: sequelize.STRING,
    HL7Id: sequelize.INTEGER,
    SitenameAlias: sequelize.STRING
});

//Org.findById('').then(function (article) {})//