const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VerifiableRental", function () {
  let verifiableRental;
  let owner;
  let tenant;
  let verifier;

  beforeEach(async function () {
    [owner, tenant, verifier] = await ethers.getSigners();

    const VerifiableRental = await ethers.getContractFactory("VerifiableRental");
    verifiableRental = await VerifiableRental.deploy(verifier.address);
    await verifiableRental.deployed();

    // Set up a property
    await verifiableRental.setPropertyAvailability(1, true);
  });

  describe("Booking", function () {
    it("Should allow requesting a booking", async function () {
      const encryptedData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test data"));

      await expect(verifiableRental.connect(tenant).requestBooking(1, encryptedData))
        .to.emit(verifiableRental, "BookingRequested")
        .withArgs(1, tenant.address, 1);
    });

    it("Should allow fulfilling a booking with attestation", async function () {
      const encryptedData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test data"));
      await verifiableRental.connect(tenant).requestBooking(1, encryptedData);

      const attestation = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("krnl attestation"));

      await expect(verifiableRental.connect(verifier).fulfillBooking(1, attestation))
        .to.emit(verifiableRental, "BookingConfirmed")
        .withArgs(1, attestation);
    });

    it("Should allow releasing deposit", async function () {
      // Setup booking
      const encryptedData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test data"));
      await verifiableRental.connect(tenant).requestBooking(1, encryptedData);

      const attestation = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("krnl attestation"));
      await verifiableRental.connect(verifier).fulfillBooking(1, attestation);

      // Release deposit
      const proof = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("condition proof"));

      await expect(verifiableRental.connect(tenant).releaseDeposit(1, proof))
        .to.emit(verifiableRental, "DepositReleased")
        .withArgs(1, tenant.address);
    });
  });

  describe("Property Availability", function () {
    it("Should check property availability", async function () {
      expect(await verifiableRental.isPropertyAvailable(1, 1640995200, 1641081600)).to.equal(true);
      expect(await verifiableRental.isPropertyAvailable(2, 1640995200, 1641081600)).to.equal(false);
    });
  });
});
