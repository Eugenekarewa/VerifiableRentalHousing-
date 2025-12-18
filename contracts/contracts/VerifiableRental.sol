// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IVerifiableRental.sol";

/**
 * @title VerifiableRental
 * @dev Implementation of the Verifiable Rental Protocol
 * MVP version with basic booking functionality and KRNL attestation verification
 */
contract VerifiableRental is IVerifiableRental {

    // State variables
    mapping(uint256 => Booking) public bookings;
    mapping(uint256 => bool) public propertyAvailability;
    uint256 private nextBookingId = 1;

    address public owner;
    address public verifier; // KRNL verifier contract address

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyVerifier() {
        require(msg.sender == verifier, "Only verifier can call this function");
        _;
    }

    modifier bookingExists(uint256 bookingId) {
        require(bookings[bookingId].tenant != address(0), "Booking does not exist");
        _;
    }

    constructor(address _verifier) {
        owner = msg.sender;
        verifier = _verifier;
    }

    /**
     * @dev Request a new booking
     */
    function requestBooking(
        uint256 propertyId,
        bytes calldata encryptedUserData
    ) external override returns (uint256 bookingId) {
        bookingId = nextBookingId++;

        bookings[bookingId] = Booking({
            tenant: msg.sender,
            propertyId: propertyId,
            depositAmount: 0, // To be set during fulfillment
            checkInDate: 0, // To be set during fulfillment
            checkOutDate: 0, // To be set during fulfillment
            verificationHash: keccak256(encryptedUserData),
            status: BookingStatus.Requested
        });

        emit BookingRequested(bookingId, msg.sender, propertyId);
        return bookingId;
    }

    /**
     * @dev Fulfill booking with KRNL attestation (simplified for MVP)
     */
    function fulfillBooking(
        uint256 bookingId,
        bytes calldata krnlAttestation
    ) external override onlyVerifier bookingExists(bookingId) {
        Booking storage booking = bookings[bookingId];
        require(booking.status == BookingStatus.Requested, "Booking not in requested state");

        // In MVP, we trust the verifier's attestation
        // In production, this would verify cryptographic proofs
        booking.status = BookingStatus.Confirmed;
        booking.verificationHash = keccak256(krnlAttestation);

        emit BookingConfirmed(bookingId, booking.verificationHash);
    }

    /**
     * @dev Release deposit after successful verification
     */
    function releaseDeposit(
        uint256 bookingId,
        bytes calldata conditionProof
    ) external override bookingExists(bookingId) {
        Booking storage booking = bookings[bookingId];
        require(booking.status == BookingStatus.Confirmed, "Booking not confirmed");
        require(msg.sender == booking.tenant || msg.sender == owner, "Unauthorized");

        booking.status = BookingStatus.Completed;

        // In MVP, just mark as completed
        // In production, this would handle actual fund transfers
        emit DepositReleased(bookingId, booking.tenant);
    }

    /**
     * @dev Get booking details
     */
    function getBooking(uint256 bookingId)
        external
        view
        override
        bookingExists(bookingId)
        returns (Booking memory)
    {
        return bookings[bookingId];
    }

    /**
     * @dev Check property availability (simplified for MVP)
     */
    function isPropertyAvailable(
        uint256 propertyId,
        uint256 checkInDate,
        uint256 checkOutDate
    ) external view override returns (bool) {
        // In MVP, assume all properties are available
        // In production, this would check actual availability
        return propertyAvailability[propertyId] != false;
    }

    /**
     * @dev Set property availability (admin function)
     */
    function setPropertyAvailability(uint256 propertyId, bool available) external onlyOwner {
        propertyAvailability[propertyId] = available;
    }

    /**
     * @dev Update verifier address
     */
    function setVerifier(address _verifier) external onlyOwner {
        verifier = _verifier;
    }
}
