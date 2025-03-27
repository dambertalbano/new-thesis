import React from 'react'
import { AddEmployeeCard, AddStudentCard, AddTeachersCard } from '../../components/UserCard'

const AddUsers = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <AddStudentCard />
      <AddTeachersCard />
      <AddEmployeeCard />
    </div>
  )
}

export default AddUsers
