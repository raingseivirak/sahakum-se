import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/initiatives/[id]/members/[memberId] - Update member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "BOARD", "EDITOR"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { role, contributionNote } = body

    // Validate role if provided
    if (role && !["LEAD", "CO_LEAD", "MEMBER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      )
    }

    // Check if member exists
    const existingMember = await prisma.initiativeMember.findUnique({
      where: { id: params.memberId },
    })

    if (!existingMember || existingMember.initiativeId !== params.id) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    // Update member
    const updatedMember = await prisma.initiativeMember.update({
      where: { id: params.memberId },
      data: {
        ...(role && { role }),
        ...(contributionNote !== undefined && { contributionNote }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    })

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    console.error("Error updating initiative member:", error)
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    )
  }
}

// DELETE /api/initiatives/[id]/members/[memberId] - Remove team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "BOARD", "EDITOR"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if member exists
    const existingMember = await prisma.initiativeMember.findUnique({
      where: { id: params.memberId },
    })

    if (!existingMember || existingMember.initiativeId !== params.id) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    // Delete member
    await prisma.initiativeMember.delete({
      where: { id: params.memberId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing initiative member:", error)
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    )
  }
}
