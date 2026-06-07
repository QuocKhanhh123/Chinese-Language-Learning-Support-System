import React from 'react'

function StatusBadge({ status }) {
    let color, label

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

export default StatusBadge
