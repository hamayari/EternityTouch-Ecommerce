import userModel from '../models/userModel.js';

// Get all addresses for a user
const getAddresses = async (req, res) => {
    try {
        const { userId } = req.body;
        
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ 
            success: true, 
            addresses: user.addresses || [] 
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Add new address
const addAddress = async (req, res) => {
    try {
        const { userId, label, firstName, lastName, phone, street, city, state, zipCode, country, isDefault } = req.body;

        // Validation
        if (!label || !firstName || !lastName || !phone || !street || !city || !state || !zipCode || !country) {
            return res.json({ success: false, message: "All fields are required" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // If this is set as default, unset all other defaults
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        // If this is the first address, make it default
        const makeDefault = user.addresses.length === 0 || isDefault;

        // Add new address
        user.addresses.push({
            label,
            firstName,
            lastName,
            phone,
            street,
            city,
            state,
            zipCode,
            country,
            isDefault: makeDefault,
            createdAt: new Date()
        });

        await user.save();

        res.json({ 
            success: true, 
            message: "Address added successfully",
            addresses: user.addresses 
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Update address
const updateAddress = async (req, res) => {
    try {
        const { userId, addressId, label, firstName, lastName, phone, street, city, state, zipCode, country, isDefault } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const address = user.addresses.id(addressId);
        if (!address) {
            return res.json({ success: false, message: "Address not found" });
        }

        // If setting as default, unset all other defaults
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        // Update address fields
        address.label = label;
        address.firstName = firstName;
        address.lastName = lastName;
        address.phone = phone;
        address.street = street;
        address.city = city;
        address.state = state;
        address.zipCode = zipCode;
        address.country = country;
        address.isDefault = isDefault;

        await user.save();

        res.json({ 
            success: true, 
            message: "Address updated successfully",
            addresses: user.addresses 
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete address
const deleteAddress = async (req, res) => {
    try {
        const { userId, addressId } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const address = user.addresses.id(addressId);
        if (!address) {
            return res.json({ success: false, message: "Address not found" });
        }

        const wasDefault = address.isDefault;
        
        // Remove address
        address.deleteOne();

        // If deleted address was default and there are other addresses, make the first one default
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        res.json({ 
            success: true, 
            message: "Address deleted successfully",
            addresses: user.addresses 
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Set default address
const setDefaultAddress = async (req, res) => {
    try {
        const { userId, addressId } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Unset all defaults
        user.addresses.forEach(addr => addr.isDefault = false);

        // Set new default
        const address = user.addresses.id(addressId);
        if (!address) {
            return res.json({ success: false, message: "Address not found" });
        }

        address.isDefault = true;
        await user.save();

        res.json({ 
            success: true, 
            message: "Default address updated",
            addresses: user.addresses 
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress };
