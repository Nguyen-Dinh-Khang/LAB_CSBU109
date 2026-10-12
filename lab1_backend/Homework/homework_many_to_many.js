require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;

// ==========================================
// 1. SCHEMAS
// ==========================================
const studentSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }]
});

const courseSchema = new Schema({
  courseCode: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  maxStudents: { type: Number, required: true },
  availableSlots: { type: Number, required: true },
  students: [{ type: Schema.Types.ObjectId, ref: 'Student' }]
});

const Student = mongoose.model('Student', studentSchema);
const Course = mongoose.model('Course', courseSchema);

// ==========================================
// 2. ENROLL COURSE (Dùng Transaction trên Atlas)
// ==========================================
async function enrollCourse(studentId, courseId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const student = await Student.findById(studentId).session(session);
    if (!student) {
      throw new Error(`Sinh viên ID ${studentId} không tồn tại.`);
    }

    const course = await Course.findById(courseId).session(session);
    if (!course) {
      throw new Error(`Môn học ID ${courseId} không tồn tại.`);
    }

    // 1. Kiểm tra đã đăng ký chưa
    const isAlreadyEnrolled = student.courses.some(
      (cId) => cId.toString() === courseId.toString()
    );
    if (isAlreadyEnrolled) {
      throw new Error(`Sinh viên "${student.name}" đã đăng ký môn "${course.title}" trước đó.`);
    }

    // 2. Kiểm tra slot trống
    if (course.availableSlots <= 0) {
      throw new Error(`Môn học "${course.title}" đã hết chỗ.`);
    }

    // 3. Cập nhật cả hai bảng đồng thời
    await Student.findByIdAndUpdate(
      studentId,
      { $addToSet: { courses: courseId } },
      { session }
    );

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $addToSet: { students: studentId },$inc: { availableSlots: -1 }
      },
      { session, new: true }
    );

    await session.commitTransaction();
    console.log(` Đăng ký thành công: "${student.name}" -> "${course.title}". Còn trống: ${updatedCourse.availableSlots}`);
  } catch (error) {
    await session.abortTransaction();
    console.error(` Đăng ký thất bại: ${error.message}`);
  } finally {
    session.endSession();
  }
}

// ==========================================
// 3. DROP COURSE (Dùng Transaction trên Atlas)
// ==========================================
async function dropCourse(studentId, courseId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const student = await Student.findById(studentId).session(session);
    if (!student) {
      throw new Error(`Sinh viên ID ${studentId} không tồn tại.`);
    }

    const course = await Course.findById(courseId).session(session);
    if (!course) {
      throw new Error(`Môn học ID ${courseId} không tồn tại.`);
    }

    // 1. Kiểm tra sinh viên có trong môn này không
    const isEnrolled = student.courses.some(
      (cId) => cId.toString() === courseId.toString()
    );
    if (!isEnrolled) {
      throw new Error(`Sinh viên "${student.name}" chưa từng đăng ký môn "${course.title}".`);
    }

    // 2. Rút ID khỏi 2 mảng và hoàn lại 1 slot
    await Student.findByIdAndUpdate(
      studentId,
      { $pull: { courses: courseId } },
      { session }
    );

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $pull: { students: studentId },$inc: { availableSlots: 1 }
      },
      { session, new: true }
    );

    await session.commitTransaction();
    console.log(` Hủy môn thành công: "${student.name}" đã hủy môn "${course.title}". Chỗ trống hiện tại: ${updatedCourse.availableSlots}`);
  } catch (error) {
    await session.abortTransaction();
    console.error(` Hủy môn thất bại: ${error.message}`);
  } finally {
    session.endSession();
  }
}

// ==========================================
// 4. KỊCH BẢN CHẠY TEST
// ==========================================
async function runDemo() {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error(' Không tìm thấy biến môi trường MONGO_URI trong file .env');
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log(' Đã kết nối MongoDB Atlas thành công!\n');

    // Dọn dữ liệu mẫu cũ
    await Student.deleteMany({});
    await Course.deleteMany({});

    // Tạo môn học có 1 slot
    const sampleCourse = await Course.create({
      courseCode: 'CS101',
      title: 'Nhập môn Lập trình Node.js',
      maxStudents: 30,
      availableSlots: 1,
      students: []
    });

    const studentA = await Student.create({
      name: 'Nguyen Van A',
      email: 'a@example.com',
      courses: []
    });

    const studentB = await Student.create({
      name: 'Tran Thi B',
      email: 'b@example.com',
      courses: []
    });

    console.log('=== TEST 1: Student A đăng ký môn CS101 ===');
    await enrollCourse(studentA._id, sampleCourse._id);

    console.log('\n=== TEST 2: Student A cố đăng ký lại (Trùng lặp) ===');
    await enrollCourse(studentA._id, sampleCourse._id);

    console.log('\n=== TEST 3: Student B đăng ký môn CS101 (Hết chỗ) ===');
    await enrollCourse(studentB._id, sampleCourse._id);

    console.log('\n=== TEST 4: Student A hủy môn CS101 (Hoàn slot) ===');
    await dropCourse(studentA._id, sampleCourse._id);

    console.log('\n=== TEST 5: Student B đăng ký lại sau khi có slot ===');
    await enrollCourse(studentB._id, sampleCourse._id);

  } catch (err) {
    console.error('Lỗi thực thi:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n Đã ngắt kết nối Atlas.');
  }
}

runDemo();