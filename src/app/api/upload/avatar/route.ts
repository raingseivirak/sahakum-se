import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { storageService } from '@/lib/storage'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Upload avatar using storage service
    const uploadResult = await storageService.uploadAvatar(file, session.user.id)

    // Update user's profile image in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { profileImage: uploadResult.url }
    })

    return NextResponse.json({
      success: true,
      file: uploadResult,
      message: 'Avatar uploaded successfully'
    })

  } catch (error) {
    console.error('Avatar upload error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get current user's avatar
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { profileImage: true }
    })

    if (!user?.profileImage) {
      return NextResponse.json(
        { error: 'No avatar to delete' },
        { status: 404 }
      )
    }

    // Find the media file by URL
    const mediaFile = await prisma.mediaFile.findFirst({
      where: { url: user.profileImage }
    })

    if (mediaFile) {
      // Delete file using storage service
      await storageService.deleteFile(mediaFile.id)
    }

    // Remove avatar from user profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: { profileImage: null }
    })

    return NextResponse.json({
      success: true,
      message: 'Avatar deleted successfully'
    })

  } catch (error) {
    console.error('Avatar delete error:', error)

    return NextResponse.json(
      { error: 'Failed to delete avatar' },
      { status: 500 }
    )
  }
}