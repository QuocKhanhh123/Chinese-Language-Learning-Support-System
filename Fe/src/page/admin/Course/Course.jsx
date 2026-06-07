// App.jsx
import React, { useState } from 'react'
import {
  Add,
  Edit,
  Delete,
  Search,
  FilterList,
  MoreVert,
} from '@mui/icons-material'

function Course() {
  // Sample data
  const courses = [
    {
      id: 1,
      title: 'Tiếng Nhật N5 cho người mới bắt đầu',
      students: 145,
      lessons: 24,
      status: 'active',
    },
    {
      id: 2,
      title: 'Tiếng Nhật N4 - Ngữ pháp nâng cao',
      students: 98,
      lessons: 30,
      status: 'active',
    },
    {
      id: 3,
      title: 'Kanji N3 - Học nhanh nhớ lâu',
      students: 76,
      lessons: 18,
      status: 'draft',
    },
    {
      id: 4,
      title: 'Luyện nghe JLPT N2',
      students: 54,
      lessons: 20,
      status: 'active',
    },
    {
      id: 5,
      title: 'Đàm thoại thương mại tiếng Nhật',
      students: 32,
      lessons: 15,
      status: 'inactive',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Quản lý Khóa học Tiếng Nhật
          </h1>
          <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
            <Add className="mr-1" /> Thêm khóa học mới
          </button>
        </div>

        {/* Content */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold">Danh sách khóa học</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {courses.length} khóa học
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm khóa học..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80"
                />
              </div>
              <div className="flex items-center space-x-2">
                <button className="flex items-center text-gray-700 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <FilterList className="mr-1" /> Lọc
                </button>
              </div>
            </div>

            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên khóa học
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Học viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bài học
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{course.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.students}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.lessons}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={course.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit fontSize="small" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Delete fontSize="small" />
                        </button>
                        <button className="text-gray-500 hover:text-gray-700">
                          <MoreVert fontSize="small" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">1</span> đến{' '}
                <span className="font-medium">5</span> trong{' '}
                <span className="font-medium">5</span> kết quả
              </div>
              <div className="flex space-x-1">
                <button
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  disabled
                >
                  Trước
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  1
                </button>
                <button
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  disabled
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component for status badge
function StatusBadge({ status }) {
  let color
  let label

  switch (status) {
    case 'active':
      color = 'bg-green-100 text-green-800'
      label = 'Hoạt động'
      break
    case 'inactive':
      color = 'bg-red-100 text-red-800'
      label = 'Ngừng hoạt động'
      break
    case 'draft':
      color = 'bg-yellow-100 text-yellow-800'
      label = 'Bản nháp'
      break
    default:
      color = 'bg-gray-100 text-gray-800'
      label = 'Không xác định'
  }

  return (
    <span className={`${color} px-2 py-1 text-xs font-medium rounded-full`}>
      {label}
    </span>
  )
}

export default Course
