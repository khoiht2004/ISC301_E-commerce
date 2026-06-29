const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplier.controller");

const { authenticateToken, authorizeRoles } = require("../middlewares/auth");
const { ROLES } = require("../constants/roles");

router.use(authenticateToken, authorizeRoles(ROLES.STAFF, ROLES.ADMIN));

router.get("/", supplierController.getAllSuppliers);

module.exports = router;
