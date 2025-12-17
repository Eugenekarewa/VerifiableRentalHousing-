// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IVerifiableRental
 * @dev Interface for the Verifiable Rental Protocol smart contract
 * Implements cryptographically verifiable rental workflows
 */
interface IVerifiableRental {

    enum BookingStatus {
        Requested,
        Verified,
        Confirmed,
        Active,
        Completed,
        Cancelled,
        Disputed
    }

    struct Booking {
        address tenant;
        uint256 propertyId;
        uint256 depositAmount;
        uint256 checkInDate;
        uint256 checkOutDate;
        bytes32 verificationHash;
        BookingStatus status;
    }

    event BookingRequested(uint256 indexed bookingId, address indexed tenant, uint256 indexed propertyId);
    event BookingConfirmed(uint256 indexed bookingId, bytes32 verificationHash);
    event DepositReleased(uint256 indexed bookingId, address indexed tenant);
    event DepositClaimed(uint256 indexed bookingId, address indexed landlord);

    /**
     * @dev Request a new booking with encrypted user data
     * @param propertyId The ID of the property to book
     * @param encryptedUserData Encrypted user verification data
     * @return bookingId The unique booking identifier
     */
    function requestBooking(
        uint256 propertyId,
        bytes calldata encryptedUserData
    ) external returns (uint256 bookingId);

    /**
     * @dev Fulfill a booking request with KRNL attestation
     * @param bookingId The booking to fulfill
     * @param krnlAttestation The cryptographic proof from KRNL workflow
     */
    function fulfillBooking(
        uint256 bookingId,
        bytes calldata krnlAttestation
    ) external;

    /**
     * @dev Release deposit after successful stay verification
     * @param bookingId The booking to release deposit for
     * @param conditionProof Proof that conditions for release are met
     */
    function releaseDeposit(
        uint256 bookingId,
        bytes calldata conditionProof
    ) external;

    /**
     * @dev Get booking details
     * @param bookingId The booking ID to query
     * @return Booking struct with booking information
     */
    function getBooking(uint256 bookingId) external view returns (Booking memory);

    /**
     * @dev Check if a property is available for booking
     * @param propertyId The property to check
     * @param checkInDate Check-in date timestamp
     * @param checkOutDate Check-out date timestamp
     * @return True if property is available
     */
    function isPropertyAvailable(
        uint256 propertyId,
        uint256 checkInDate,
        uint256 checkOutDate
    ) external view returns (bool);
}
