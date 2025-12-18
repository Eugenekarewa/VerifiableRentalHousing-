// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VerifiableRental
 * @dev Implementation of the Verifiable Rental Protocol with integrated interface
 * MVP version with basic booking functionality and KRNL attestation verification
 */
contract VerifiableRental {

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

    // State variables
    mapping(uint256 => Booking) public bookings;
    mapping(uint256 => bool) public propertyAvailability;
    uint256 private nextBookingId = 1;

    address public owner;
    address public verifier; // KRNL verifier contract address

    // Events
    event BookingRequested(uint256 indexed bookingId, address indexed tenant, uint256 indexed propertyId);
    event BookingConfirmed(uint256 indexed bookingId, bytes32 verificationHash);
    event DepositReleased(uint256 indexed bookingId, address indexed tenant);
    event DepositClaimed(uint256 indexed bookingId, address indexed landlord);
    event PropertyAvailabilitySet(uint256 indexed propertyId, bool available);
    event VerifierUpdated(address indexed verifier);
    event BookingCancelled(uint256 indexed bookingId, address indexed cancelledBy);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event ContractMaintenance(address indexed caller, uint256 timestamp);

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
     * @dev Request a new booking with encrypted user data
     * @param propertyId The ID of the property to book
     * @param encryptedUserData Encrypted user verification data
     * @return bookingId The unique booking identifier
     */
    function requestBooking(
        uint256 propertyId,
        bytes calldata encryptedUserData
    ) external returns (uint256 bookingId) {
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
     * @dev Fulfill a booking request with KRNL attestation
     * @param bookingId The booking to fulfill
     * @param krnlAttestation The cryptographic proof from KRNL workflow
     */
    function fulfillBooking(
        uint256 bookingId,
        bytes calldata krnlAttestation
    ) external onlyVerifier bookingExists(bookingId) {
        Booking storage booking = bookings[bookingId];
        require(booking.status == BookingStatus.Requested, "Booking not in requested state");

        // In MVP, we trust the verifier's attestation
        // In production, this would verify cryptographic proofs
        booking.status = BookingStatus.Confirmed;
        booking.verificationHash = keccak256(krnlAttestation);

        emit BookingConfirmed(bookingId, booking.verificationHash);
    }

    /**
     * @dev Release deposit after successful stay verification
     * @param bookingId The booking to release deposit for
     */
    function releaseDeposit(
        uint256 bookingId
    ) external bookingExists(bookingId) {
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
     * @param bookingId The booking ID to query
     * @return Booking struct with booking information
     */
    function getBooking(uint256 bookingId)
        external
        view
        bookingExists(bookingId)
        returns (Booking memory)
    {
        return bookings[bookingId];
    }

    /**
     * @dev Check if a property is available for booking
     * @param propertyId The property to check
     * @return True if property is available
     */
    function isPropertyAvailable(
        uint256 propertyId
    ) external view returns (bool) {
        // In MVP, we only check basic availability flag
        // In production, this would check actual date ranges and overlapping bookings
        // Check if property exists and is marked as available
        // Note: For MVP, we consider any property that isn't explicitly marked as unavailable
        return propertyAvailability[propertyId] != false;
    }

    /**
     * @dev Set property availability (admin function)
     */
    function setPropertyAvailability(uint256 propertyId, bool available) external onlyOwner {
        propertyAvailability[propertyId] = available;
        emit PropertyAvailabilitySet(propertyId, available);
    }

    /**
     * @dev Update verifier address
     */
    function setVerifier(address _verifier) external onlyOwner {
        require(_verifier != address(0), "Invalid verifier address");
        verifier = _verifier;
        emit VerifierUpdated(_verifier);
    }

    /**
     * @dev Cancel a booking (only by tenant or owner)
     */
    function cancelBooking(uint256 bookingId) external bookingExists(bookingId) {
        Booking storage booking = bookings[bookingId];
        require(
            msg.sender == booking.tenant || msg.sender == owner,
            "Only tenant or owner can cancel"
        );
        require(
            booking.status == BookingStatus.Requested || booking.status == BookingStatus.Confirmed,
            "Cannot cancel completed or non-existent booking"
        );
        
        booking.status = BookingStatus.Cancelled;
        emit BookingCancelled(bookingId, msg.sender);
    }

    /**
     * @dev Claim deposit by landlord in case of violation
     * @param bookingId The booking ID to claim deposit for
     */
    function claimDeposit(uint256 bookingId) external onlyOwner bookingExists(bookingId) {
        Booking storage booking = bookings[bookingId];
        require(booking.status == BookingStatus.Confirmed, "Booking not in confirmed state");
        
        // In production, verify violation proof
        // For MVP, just allow claim
        booking.status = BookingStatus.Completed;
        emit DepositClaimed(bookingId, owner);
    }

    /**
     * @dev Get next available booking ID
     */
    function getNextBookingId() external view returns (uint256) {
        return nextBookingId;
    }

    /**
     * @dev Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner address");
        owner = newOwner;
        emit OwnershipTransferred(msg.sender, newOwner);
    }

    /**
     * @dev Run function - maintenance or testing function
     */
    function run() external onlyOwner returns (bool) {
        // This function can be used for maintenance or testing
        emit ContractMaintenance(msg.sender, block.timestamp);
        return true;
    }

    /**
     * @dev Check if booking exists (public view function)
     */
    function bookingExistsCheck(uint256 bookingId) external view returns (bool) {
        return bookings[bookingId].tenant != address(0);
    }

    /**
     * @dev Get all bookings for a specific tenant
     * @param tenant Address of the tenant
     * @return Array of booking IDs for the tenant
     * Note: This function can be gas-intensive and should be used carefully
     */
    function getTenantBookings(address tenant) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // First, count bookings for this tenant
        for (uint256 i = 1; i < nextBookingId; i++) {
            if (bookings[i].tenant == tenant) {
                count++;
            }
        }
        
        // Then, create array with bookings
        uint256[] memory tenantBookings = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i < nextBookingId; i++) {
            if (bookings[i].tenant == tenant) {
                tenantBookings[index] = i;
                index++;
            }
        }
        
        return tenantBookings;
    }

    /**
     * @dev Emergency pause functionality
     */
    function emergencyPause() external onlyOwner {
        // In production, you would implement a pausable pattern
        // For MVP, this is a placeholder
        emit ContractMaintenance(msg.sender, block.timestamp);
    }

    /**
     * @dev Get booking status as string
     * @param bookingId The booking ID
     * @return Status name as string
     */
    function getBookingStatusString(uint256 bookingId) 
        external 
        view 
        bookingExists(bookingId) 
        returns (string memory) 
    {
        BookingStatus status = bookings[bookingId].status;
        
        if (status == BookingStatus.Requested) return "Requested";
        if (status == BookingStatus.Verified) return "Verified";
        if (status == BookingStatus.Confirmed) return "Confirmed";
        if (status == BookingStatus.Active) return "Active";
        if (status == BookingStatus.Completed) return "Completed";
        if (status == BookingStatus.Cancelled) return "Cancelled";
        if (status == BookingStatus.Disputed) return "Disputed";
        
        return "Unknown";
    }
}