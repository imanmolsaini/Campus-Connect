"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Layout } from "@/components/layout/Layout"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { chatAPI, friendRequestAPI, groupChatAPI } from "@/services/api"
import type { Conversation, Message, FriendRequest, Group, GroupMessage, GroupMember } from "@/types"
import { useAuth } from "@/contexts/AuthContext"
import {
  Send,
  UserPlus,
  Users,
  MessageCircle,
  X,
  Check,
  Search,
  MessageSquare,
  UsersRound,
  UserPlus2,
  Trash2,
  LogOut,
  MoreVertical,
  Paperclip,
  Download,
  FileText,
  ImageIcon,
  File,
} from "lucide-react"
import toast from "react-hot-toast"

export default function ChatPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedFriend, setSelectedFriend] = useState<Conversation | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [showFriendRequests, setShowFriendRequests] = useState(false)
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showAddMembers, setShowAddMembers] = useState(false)
  const [showGroupMenu, setShowGroupMenu] = useState(false)
  const [addMemberEmails, setAddMemberEmails] = useState("")
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])
  const [friendEmail, setFriendEmail] = useState("")
  const [groupName, setGroupName] = useState("")
  const [groupEmails, setGroupEmails] = useState("")
  const [friendRequests, setFriendRequests] = useState<{ received: FriendRequest[]; sent: FriendRequest[] }>({
    received: [],
    sent: [],
  })
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
    loadGroups()
    loadFriendRequests()
    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      loadConversations()
      loadGroups()
      if (selectedFriend) {
        loadMessages(selectedFriend.friend_id)
      }
      if (selectedGroup) {
        loadGroupMessages(selectedGroup.id)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedFriend) {
      loadMessages(selectedFriend.friend_id)
      setSelectedGroup(null)
    }
  }, [selectedFriend])

  useEffect(() => {
    if (selectedGroup) {
      loadGroupMessages(selectedGroup.id)
      loadGroupMembers(selectedGroup.id)
      setSelectedFriend(null)
    }
  }, [selectedGroup])

  useEffect(() => {
    scrollToBottom()
  }, [messages, groupMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadConversations = async () => {
    try {
      const response = await chatAPI.getConversations()
      if (response.success && response.data) {
        setConversations(response.data.conversations)
      }
    } catch (error) {
      console.error("Failed to load conversations:", error)
    }
  }

  const loadGroups = async () => {
    try {
      const response = await groupChatAPI.getUserGroups()
      if (response.success && response.data) {
        setGroups(response.data.groups)
      }
    } catch (error) {
      console.error("Failed to load groups:", error)
    }
  }

  const loadMessages = async (friendId: string) => {
    try {
      const response = await chatAPI.getConversation(friendId)
      if (response.success && response.data) {
        setMessages(response.data.messages)
        // Mark as read
        await chatAPI.markAsRead(friendId)
        loadConversations() // Refresh to update unread counts
      }
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
  }

  const loadGroupMessages = async (groupId: string) => {
    try {
      const response = await groupChatAPI.getGroupConversation(groupId)
      if (response.success && response.data) {
        setGroupMessages(response.data.messages)
      }
    } catch (error) {
      console.error("Failed to load group messages:", error)
    }
  }

  const loadGroupMembers = async (groupId: string) => {
    try {
      const response = await groupChatAPI.getGroupMembers(groupId)
      if (response.success && response.data) {
        setGroupMembers(response.data.members)
      }
    } catch (error) {
      console.error("Failed to load group members:", error)
    }
  }

  const loadFriendRequests = async () => {
    try {
      const response = await friendRequestAPI.getFriendRequests()
      if (response.success && response.data) {
        setFriendRequests(response.data)
      }
    } catch (error) {
      console.error("Failed to load friend requests:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() && !selectedFile) return

    if (selectedFriend) {
      setLoading(true)
      try {
        const response = await chatAPI.sendMessage(selectedFriend.friend_id, newMessage, selectedFile || undefined)
        if (response.success) {
          setNewMessage("")
          setSelectedFile(null)
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
          loadMessages(selectedFriend.friend_id)
          loadConversations()
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to send message")
      } finally {
        setLoading(false)
      }
    } else if (selectedGroup) {
      setLoading(true)
      try {
        const response = await groupChatAPI.sendGroupMessage(selectedGroup.id, newMessage, selectedFile || undefined)
        if (response.success) {
          setNewMessage("")
          setSelectedFile(null)
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
          loadGroupMessages(selectedGroup.id)
          loadGroups()
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to send message")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSendFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!friendEmail.trim()) return

    setLoading(true)
    try {
      const response = await friendRequestAPI.sendFriendRequest(friendEmail)
      if (response.success) {
        toast.success("Friend request sent successfully!")
        setFriendEmail("")
        setShowAddFriend(false)
        loadFriendRequests()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send friend request")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim() || !groupEmails.trim()) return

    setLoading(true)
    try {
      const emailArray = groupEmails
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email)
      const response = await groupChatAPI.createGroup({
        name: groupName,
        memberEmails: emailArray,
      })
      if (response.success) {
        toast.success("Group created successfully!")
        if (response.data?.group.notFoundEmails && response.data.group.notFoundEmails.length > 0) {
          toast.error(`Some emails were not found: ${response.data.group.notFoundEmails.join(", ")}`)
        }
        setGroupName("")
        setGroupEmails("")
        setShowCreateGroup(false)
        loadGroups()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create group")
    } finally {
      setLoading(false)
    }
  }

  const handleAddMembers = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addMemberEmails.trim() || !selectedGroup) return

    setLoading(true)
    try {
      const emailArray = addMemberEmails
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email)
      const response = await groupChatAPI.addGroupMembers(selectedGroup.id, emailArray)
      if (response.success) {
        toast.success(`Added ${response.data?.addedMembers.length} member(s) successfully!`)
        setAddMemberEmails("")
        setShowAddMembers(false)
        loadGroupMembers(selectedGroup.id)
        loadGroups()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add members")
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveGroup = async () => {
    if (!selectedGroup) return

    if (!confirm(`Are you sure you want to leave "${selectedGroup.name}"?`)) return

    try {
      const response = await groupChatAPI.leaveGroup(selectedGroup.id)
      if (response.success) {
        toast.success("Left group successfully")
        setSelectedGroup(null)
        setShowGroupMenu(false)
        loadGroups()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to leave group")
    }
  }

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return

    if (!confirm(`Are you sure you want to delete "${selectedGroup.name}"? This action cannot be undone.`)) return

    try {
      const response = await groupChatAPI.deleteGroup(selectedGroup.id)
      if (response.success) {
        toast.success("Group deleted successfully")
        setSelectedGroup(null)
        setShowGroupMenu(false)
        loadGroups()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete group")
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await friendRequestAPI.acceptFriendRequest(requestId)
      if (response.success) {
        toast.success("Friend request accepted!")
        loadFriendRequests()
        loadConversations()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to accept request")
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      const response = await friendRequestAPI.rejectFriendRequest(requestId)
      if (response.success) {
        toast.success("Friend request rejected")
        loadFriendRequests()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject request")
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10485760) {
        toast.error("File size must be less than 10MB")
        e.target.value = ""
        return
      }
      setSelectedFile(file)
      toast.success(`File selected: ${file.name}`)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDownloadAttachment = async (messageId: string) => {
    try {
      await chatAPI.downloadAttachment(messageId)
      toast.success("Download started")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to download attachment")
    }
  }

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <File className="w-4 h-4" />
    if (mimeType.startsWith("image/")) return <ImageIcon className="w-4 h-4" />
    if (mimeType.includes("pdf") || mimeType.includes("document")) return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ""
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.friend_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredGroups = groups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    } else if (days === 1) {
      return "Yesterday"
    } else if (days < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" })
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600 text-lg">Connect and chat with your friends</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowFriendRequests(!showFriendRequests)}
                variant="outline"
                className="border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 bg-transparent transition-all"
              >
                <Users className="w-4 h-4 mr-2 text-purple-600" />
                <span className="font-medium">Requests</span>
                {friendRequests.received.length > 0 && (
                  <span className="ml-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full px-2.5 py-0.5 font-bold shadow-sm animate-pulse">
                    {friendRequests.received.length}
                  </span>
                )}
              </Button>
              <Button
                onClick={() => setShowAddFriend(!showAddFriend)}
                variant="outline"
                className="border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 bg-transparent transition-all"
              >
                <UserPlus className="w-4 h-4 mr-2 text-blue-600" />
                <span className="font-medium">Add Friend</span>
              </Button>
              <Button
                onClick={() => setShowCreateGroup(!showCreateGroup)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all"
              >
                <UsersRound className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </div>
          </div>
        </div>

        {showAddFriend && (
          <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-white to-blue-50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Add Friend</h2>
              </div>
              <button
                onClick={() => setShowAddFriend(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSendFriendRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Friend's Email Address</label>
                <Input
                  type="email"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  placeholder="friend@aut.ac.nz"
                  required
                  className="border-2 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the email address of the person you want to connect with
                </p>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all"
              >
                {loading ? "Sending..." : "Send Friend Request"}
              </Button>
            </form>
          </Card>
        )}

        {showCreateGroup && (
          <Card className="border-2 border-green-200 shadow-lg bg-gradient-to-br from-white to-green-50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UsersRound className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Create Group</h2>
              </div>
              <button
                onClick={() => setShowCreateGroup(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Group Name</label>
                <Input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Study Group, Project Team, etc."
                  required
                  className="border-2 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Member Email Addresses</label>
                <Input
                  type="text"
                  value={groupEmails}
                  onChange={(e) => setGroupEmails(e.target.value)}
                  placeholder="email1@aut.ac.nz, email2@aut.ac.nz, email3@aut.ac.nz"
                  required
                  className="border-2 focus:border-green-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter multiple email addresses separated by commas. You will be added automatically.
                </p>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all"
              >
                {loading ? "Creating..." : "Create Group"}
              </Button>
            </form>
          </Card>
        )}

        {showAddMembers && selectedGroup && (
          <Card className="border-2 border-green-200 shadow-lg bg-gradient-to-br from-white to-green-50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserPlus2 className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Add Members to {selectedGroup.name}</h2>
              </div>
              <button
                onClick={() => setShowAddMembers(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMembers} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Member Email Addresses</label>
                <Input
                  type="text"
                  value={addMemberEmails}
                  onChange={(e) => setAddMemberEmails(e.target.value)}
                  placeholder="email1@aut.ac.nz, email2@aut.ac.nz"
                  required
                  className="border-2 focus:border-green-500"
                />
                <p className="text-xs text-gray-500 mt-2">Enter multiple email addresses separated by commas</p>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Current Members ({groupMembers.length})</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {groupMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-700">{member.name}</span>
                      <span className="text-gray-500">({member.email})</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all"
              >
                {loading ? "Adding..." : "Add Members"}
              </Button>
            </form>
          </Card>
        )}

        {showFriendRequests && (
          <Card className="border-2 border-purple-200 shadow-lg bg-gradient-to-br from-white to-purple-50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Friend Requests</h2>
              </div>
              <button
                onClick={() => setShowFriendRequests(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">Received</h3>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                    {friendRequests.received.length}
                  </span>
                </div>
                {friendRequests.received.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm font-medium">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {friendRequests.received.map((request) => (
                      <div
                        key={request.id}
                        className="group flex items-center justify-between p-4 bg-white hover:bg-purple-50 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {request.sender_name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{request.sender_name}</p>
                            <p className="text-sm text-gray-500">{request.sender_email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(request.id)}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-sm"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectRequest(request.id)}
                            className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-transparent"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">Sent</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {friendRequests.sent.length}
                  </span>
                </div>
                {friendRequests.sent.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <Send className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm font-medium">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {friendRequests.sent.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {request.receiver_name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{request.receiver_name}</p>
                            <p className="text-sm text-gray-500">{request.receiver_email}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                          Pending
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[650px]">
          {/* Conversations List */}
          <Card className="border-2 border-gray-200 shadow-lg overflow-hidden flex flex-col bg-gradient-to-br from-white to-gray-50">
            <div className="p-4 border-b-2 border-gray-200 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-lg">Conversations</h3>
                <span className="ml-auto px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  {conversations.length + groups.length}
                </span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredGroups.length === 0 && filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">No conversations yet</p>
                  <p className="text-sm text-gray-500">Add friends or create groups to start chatting</p>
                </div>
              ) : (
                <>
                  {filteredGroups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroup(group)}
                      className={`w-full text-left p-4 rounded-xl transition-all group ${
                        selectedGroup?.id === group.id
                          ? "bg-gradient-to-r from-green-500 to-green-600 shadow-lg border-2 border-green-600"
                          : "bg-white hover:bg-green-50 border-2 border-gray-200 hover:border-green-300 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg shadow-md ${
                            selectedGroup?.id === group.id
                              ? "bg-white text-green-600"
                              : "bg-gradient-to-br from-green-400 to-green-600 text-white"
                          }`}
                        >
                          <UsersRound className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p
                              className={`font-bold truncate ${
                                selectedGroup?.id === group.id ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {group.name}
                            </p>
                            {group.last_message_time && (
                              <span
                                className={`text-xs font-medium ${
                                  selectedGroup?.id === group.id ? "text-green-100" : "text-gray-500"
                                }`}
                              >
                                {formatTime(group.last_message_time)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-sm truncate ${
                                selectedGroup?.id === group.id ? "text-green-100" : "text-gray-600"
                              }`}
                            >
                              {group.last_message
                                ? `${group.last_sender_name}: ${group.last_message}`
                                : `${group.member_count} members`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* Render conversations */}
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.friend_id}
                      onClick={() => setSelectedFriend(conv)}
                      className={`w-full text-left p-4 rounded-xl transition-all group ${
                        selectedFriend?.friend_id === conv.friend_id
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg border-2 border-blue-600"
                          : "bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg shadow-md ${
                            selectedFriend?.friend_id === conv.friend_id
                              ? "bg-white text-blue-600"
                              : "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
                          }`}
                        >
                          {conv.friend_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p
                              className={`font-bold truncate ${
                                selectedFriend?.friend_id === conv.friend_id ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {conv.friend_name}
                            </p>
                            {conv.last_message_time && (
                              <span
                                className={`text-xs font-medium ${
                                  selectedFriend?.friend_id === conv.friend_id ? "text-blue-100" : "text-gray-500"
                                }`}
                              >
                                {formatTime(conv.last_message_time)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-sm truncate ${
                                selectedFriend?.friend_id === conv.friend_id ? "text-blue-100" : "text-gray-600"
                              }`}
                            >
                              {conv.last_message || "No messages yet"}
                            </p>
                            {conv.unread_count > 0 && (
                              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full px-2 py-0.5 ml-2 font-bold shadow-sm">
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </Card>

          <Card className="lg:col-span-2 border-2 border-gray-200 shadow-lg flex flex-col overflow-hidden bg-gradient-to-br from-white to-gray-50">
            {selectedFriend || selectedGroup ? (
              <>
                <div className="border-b-2 border-gray-200 p-5 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedFriend ? (
                        <>
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {selectedFriend.friend_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">{selectedFriend.friend_name}</h2>
                            <p className="text-sm text-gray-500 font-medium">{selectedFriend.friend_email}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shadow-lg">
                            <UsersRound className="w-7 h-7" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">{selectedGroup?.name}</h2>
                            <p className="text-sm text-gray-500 font-medium">{selectedGroup?.member_count} members</p>
                          </div>
                        </>
                      )}
                    </div>
                    {selectedGroup && (
                      <div className="relative">
                        <button
                          onClick={() => setShowGroupMenu(!showGroupMenu)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                        {showGroupMenu && (
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border-2 border-gray-200 z-10">
                            <button
                              onClick={() => {
                                setShowAddMembers(true)
                                setShowGroupMenu(false)
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 text-left transition-all rounded-t-xl"
                            >
                              <UserPlus2 className="w-5 h-5 text-green-600" />
                              <span className="font-medium text-gray-700">Add Members</span>
                            </button>
                            <button
                              onClick={handleLeaveGroup}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 text-left transition-all"
                            >
                              <LogOut className="w-5 h-5 text-orange-600" />
                              <span className="font-medium text-gray-700">Leave Group</span>
                            </button>
                            {selectedGroup.created_by === user?.id && (
                              <button
                                onClick={handleDeleteGroup}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-left transition-all rounded-b-xl border-t-2 border-gray-100"
                              >
                                <Trash2 className="w-5 h-5 text-red-600" />
                                <span className="font-medium text-red-600">Delete Group</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-br from-gray-50 to-blue-50">
                  {selectedFriend && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-4">
                          <MessageCircle className="w-10 h-10 text-blue-600" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900 mb-1">No messages yet</p>
                        <p className="text-sm text-gray-500">Start the conversation!</p>
                      </div>
                    </div>
                  ) : selectedGroup && groupMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mx-auto mb-4">
                          <UsersRound className="w-10 h-10 text-green-600" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900 mb-1">No messages yet</p>
                        <p className="text-sm text-gray-500">Start the group conversation!</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {selectedFriend &&
                        messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-md ${
                                msg.sender_id === user?.id
                                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                  : "bg-white text-gray-900 border-2 border-gray-200"
                              }`}
                            >
                              {msg.message && <p className="break-words leading-relaxed">{msg.message}</p>}
                              {msg.attachment_path && (
                                <div
                                  className={`mt-2 flex items-center gap-2 p-2 rounded-lg ${
                                    msg.sender_id === user?.id ? "bg-blue-400/30" : "bg-gray-100"
                                  }`}
                                >
                                  {getFileIcon(msg.attachment_type)}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{msg.attachment_name}</p>
                                    <p className="text-xs opacity-75">{formatFileSize(msg.attachment_size)}</p>
                                  </div>
                                  <button
                                    onClick={() => handleDownloadAttachment(msg.id)}
                                    className={`p-1 rounded hover:bg-opacity-20 ${
                                      msg.sender_id === user?.id ? "hover:bg-white" : "hover:bg-gray-300"
                                    }`}
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                              <p
                                className={`text-xs mt-2 font-medium ${
                                  msg.sender_id === user?.id ? "text-blue-100" : "text-gray-500"
                                }`}
                              >
                                {formatTime(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                      {selectedGroup &&
                        groupMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-md ${
                                msg.sender_id === user?.id
                                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                                  : "bg-white text-gray-900 border-2 border-gray-200"
                              }`}
                            >
                              {msg.sender_id !== user?.id && (
                                <p className="text-xs font-bold mb-1 text-green-600">{msg.sender_name}</p>
                              )}
                              {msg.message && <p className="break-words leading-relaxed">{msg.message}</p>}
                              {msg.attachment_path && (
                                <div
                                  className={`mt-2 flex items-center gap-2 p-2 rounded-lg ${
                                    msg.sender_id === user?.id ? "bg-green-400/30" : "bg-gray-100"
                                  }`}
                                >
                                  {getFileIcon(msg.attachment_type)}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{msg.attachment_name}</p>
                                    <p className="text-xs opacity-75">{formatFileSize(msg.attachment_size)}</p>
                                  </div>
                                  <button
                                    onClick={() => handleDownloadAttachment(msg.id)}
                                    className={`p-1 rounded hover:bg-opacity-20 ${
                                      msg.sender_id === user?.id ? "hover:bg-white" : "hover:bg-gray-300"
                                    }`}
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                              <p
                                className={`text-xs mt-2 font-medium ${
                                  msg.sender_id === user?.id ? "text-green-100" : "text-gray-500"
                                }`}
                              >
                                {formatTime(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t-2 border-gray-200 p-4 bg-white">
                  {selectedFile && (
                    <div className="mb-3 flex items-center gap-2 p-2 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      {getFileIcon(selectedFile.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <button onClick={handleRemoveFile} className="p-1 hover:bg-red-100 rounded transition-colors">
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.csv,.jpg,.jpeg,.png,.gif,.webp,.zip,.rar,.7z,.mp3,.mp4,.avi,.mov,.wmv"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-gray-300 hover:bg-gray-50"
                    >
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 border-2 focus:border-blue-500"
                    />
                    <Button
                      type="submit"
                      disabled={loading || (!newMessage.trim() && !selectedFile)}
                      className={`shadow-md hover:shadow-lg transition-all px-6 ${
                        selectedGroup
                          ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                          : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      }`}
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 mb-2">Select a conversation</p>
                  <p className="text-gray-500">Choose a friend or group from the list to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  )
}
