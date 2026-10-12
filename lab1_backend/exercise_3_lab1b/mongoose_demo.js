require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shop_mongoose_db';

// --- SCHEMA DEFINITION ---
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters long']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Invalid email format']
    },
    // Question 1: Regex Phone Validation (10 chữ số: 03, 05, 07, 08, 09)
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      validate: {
        validator: function (v) {
          return /^(03|05|07|08|09)\d{8}$/.test(v);
        },
        message: props => `${props.value} is not a valid Vietnamese phone number!`
      }
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    age: {
      type: Number,
      min: [18, 'User age must be at least 18'],
      max: [100, 'Invalid age']
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'manager'],
      default: 'user'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    // Question 4: Soft delete field
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    // Question 2: Bật virtuals khi serialize JSON / Object
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// --- QUESTION 2: Virtual Field ---
userSchema.virtual('displayInfo').get(function () {
  return `${this.fullName} <${this.email}> [${this.role.toUpperCase()}]`;
});

// --- QUESTION 3: Static Method ---
userSchema.statics.findActiveByRole = function (roleName) {
  return this.find({ role: roleName, isActive: true }).sort({ fullName: 1 });
};

// --- QUESTION 4: Instance Method (Soft Delete) ---
userSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.isActive = false;
  return this.save();
};

// --- QUESTION 5: Middleware Hooks ---
// Pre-save: Giả lập hash password trước khi lưu
userSchema.pre('save', function () {
  if (this.isModified('password')) {
    console.log(`[Middleware Pre-save] Hashing password for: ${this.email}`);
    this.password = `hashed_secret_${this.password}`;
  }
});

// Pre-find hook: Tự động loại bỏ bản ghi có isDeleted: true
userSchema.pre(/^find/, function () {
  this.where({ isDeleted: { $ne: true } });
});

const User = mongoose.model('User', userSchema);

// --- DEMO RUNNER ---
async function runExtendedLab() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('-> Connected to MongoDB successfully via Mongoose ODM!\n');

    // Dọn dẹp dữ liệu cũ (Dùng collection native để bypass hook find/delete)
    await User.collection.deleteMany({});

    // === QUESTION 1: Custom Validation with Regex ===
    console.log('--- QUESTION 1: TRIGGER PHONE VALIDATION ERROR ---');
    try {
      await User.create({
        fullName: 'Le Error',
        email: 'error.test@example.com',
        phone: '0123456789', // Số sai tiền tố (không thuộc 03, 05, 07, 08, 09)
        password: 'pass123Wrong',
        age: 20
      });
    } catch (err) {
      console.log('Validation caught successfully:');
      console.log('Error Message ->', err.errors?.phone?.message || err.message);
    }

    // === QUESTION 5 (Pre-save) + QUESTION 2 (Virtual Field) ===
    console.log('\n--- QUESTION 2 & 5: CREATE VALID USERS & SHOW VIRTUAL PROPERTY ---');
    const userA = await User.create({
      fullName: 'Nguyen Van Hung',
      email: 'hung.nguyen@example.com',
      phone: '0912345678',
      password: 'mypassword123',
      age: 22,
      role: 'admin'
    });

    const userB = await User.create({
      fullName: 'An Hoang',
      email: 'an.hoang@example.com',
      phone: '0987654321',
      password: 'secretpass456',
      age: 25,
      role: 'admin'
    });

    console.log('User created with Hashed Password:', userA.password);
    console.log('displayInfo (Virtual property):', userA.displayInfo);
    console.log('JSON output contains virtual:', JSON.stringify(userA.toJSON(), null, 2));

    // === QUESTION 3: Static Methods ===
    console.log('\n--- QUESTION 3: STATIC METHOD findActiveByRole("admin") (A-Z) ---');
    const activeAdmins = await User.findActiveByRole('admin');
    activeAdmins.forEach(u => console.log(`- ${u.fullName} (${u.role})`));

    // === QUESTION 4 & QUESTION 5 (Pre-find Query Hook): Soft Delete ===
    console.log('\n--- QUESTION 4 & 5: SOFT DELETE & PRE-FIND QUERY HOOK FILTER ---');
    console.log(`Executing softDelete() on: ${userA.fullName}`);
    await userA.softDelete();

    // Query lại sau khi soft delete
    const remainingUsers = await User.find({});
    console.log('Remaining users found by find({}) (Soft-deleted excluded automatically):');
    remainingUsers.forEach(u => console.log(`- ${u.fullName} (isActive: ${u.isActive}, isDeleted: ${u.isDeleted})`));

  } catch (error) {
    console.error('Runtime error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n-> Mongoose connection closed.');
  }
}

runExtendedLab();