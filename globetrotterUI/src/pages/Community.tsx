import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Heart, MessageCircle, Bookmark, PlusCircle, X, Image, MapPin, Send,
    Users, TrendingUp, Globe, Share2, MoreHorizontal, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import usersData from '../data/users.json'

interface Story {
    id: string
    userId: string
    image: string
    viewed: boolean
}

interface PostComment {
    id: string
    userId: string
    text: string
    createdAt: string
}

interface CommunityPost {
    id: string
    userId: string
    tripId: string | null
    title: string
    description: string
    coverImage: string
    likes: number
    saves: number
    comments: PostComment[]
    tags: string[]
    createdAt: string
}

export default function Community() {
    const { user } = useAuth()
    const { communityPosts, cities, loadCommunityPosts, featuredDestinations } = useData()
    const [likedPosts, setLikedPosts] = useState<string[]>([])
    const [savedPosts, setSavedPosts] = useState<string[]>([])
    const [followingUsers, setFollowingUsers] = useState<string[]>([])
    const [showCreatePost, setShowCreatePost] = useState(false)
    const [newPostContent, setNewPostContent] = useState('')
    const [newPostTitle, setNewPostTitle] = useState('')
    const [selectedTab, setSelectedTab] = useState<'feed' | 'trending' | 'following'>('feed')
    const [posts, setPosts] = useState<CommunityPost[]>([])

    // Initialize posts from context
    useEffect(() => {
        loadCommunityPosts()
    }, [])

    // Update posts when communityPosts changes
    useEffect(() => {
        if (communityPosts && communityPosts.length > 0) {
            setPosts(communityPosts.map(p => ({
                ...p,
                coverImage: p.coverImage || p.cover_image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600',
                userId: p.userId || p.user_id || 'unknown',
                tripId: p.tripId || p.trip_id || null,
                likes: typeof p.likes === 'number' ? p.likes : 0,
                comments: p.comments || [],
                tags: p.tags || [],
                createdAt: p.createdAt || p.created_at || new Date().toISOString()
            })) as CommunityPost[])
        }
    }, [communityPosts])

    // Stories state
    const [stories, setStories] = useState<Story[]>([
        { id: '1', userId: 'user-001', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600', viewed: false },
        { id: '2', userId: 'user-002', image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600', viewed: false },
        { id: '3', userId: 'admin-001', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600', viewed: true },
        { id: '4', userId: 'user-003', image: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600', viewed: false },
    ])
    const [selectedStory, setSelectedStory] = useState<Story | null>(null)
    const [storyProgress, setStoryProgress] = useState(0)

    // Comments state
    const [showComments, setShowComments] = useState<string | null>(null)
    const [localComments, setLocalComments] = useState<Record<string, PostComment[]>>({})
    const [newComment, setNewComment] = useState('')

    // Share modal
    const [showShare, setShowShare] = useState<string | null>(null)

    // Load likes/saves/following/comments from localStorage
    useEffect(() => {
        const savedLikes = localStorage.getItem('community-likes')
        const savedBookmarks = localStorage.getItem('community-bookmarks')
        const savedFollowing = localStorage.getItem('community-following')
        const savedComments = localStorage.getItem('community-comments')
        if (savedLikes) setLikedPosts(JSON.parse(savedLikes))
        if (savedBookmarks) setSavedPosts(JSON.parse(savedBookmarks))
        if (savedFollowing) setFollowingUsers(JSON.parse(savedFollowing))
        if (savedComments) setLocalComments(JSON.parse(savedComments))
    }, [])

    // Story progress timer
    useEffect(() => {
        if (selectedStory) {
            const timer = setInterval(() => {
                setStoryProgress(prev => {
                    if (prev >= 100) {
                        setSelectedStory(null)
                        return 0
                    }
                    return prev + 2
                })
            }, 100)
            return () => clearInterval(timer)
        }
    }, [selectedStory])

    const toggleLike = (postId: string) => {
        const newLikes = likedPosts.includes(postId)
            ? likedPosts.filter(id => id !== postId)
            : [...likedPosts, postId]
        setLikedPosts(newLikes)
        localStorage.setItem('community-likes', JSON.stringify(newLikes))
    }

    const toggleSave = (postId: string) => {
        const newSaves = savedPosts.includes(postId)
            ? savedPosts.filter(id => id !== postId)
            : [...savedPosts, postId]
        setSavedPosts(newSaves)
        localStorage.setItem('community-bookmarks', JSON.stringify(newSaves))
    }

    const addComment = (postId: string) => {
        if (!newComment.trim()) return
        const comment: PostComment = {
            id: `comment-${Date.now()}`,
            userId: user?.id || 'unknown',
            text: newComment,
            createdAt: new Date().toISOString()
        }
        const updatedComments = {
            ...localComments,
            [postId]: [...(localComments[postId] || []), comment]
        }
        setLocalComments(updatedComments)
        localStorage.setItem('community-comments', JSON.stringify(updatedComments))
        setNewComment('')
    }

    // Toggle follow user
    const toggleFollow = (userId: string) => {
        const newFollowing = followingUsers.includes(userId)
            ? followingUsers.filter(id => id !== userId)
            : [...followingUsers, userId]
        setFollowingUsers(newFollowing)
        localStorage.setItem('community-following', JSON.stringify(newFollowing))
    }

    // Story navigation
    const goToNextStory = () => {
        if (!selectedStory) return
        const currentIndex = stories.findIndex(s => s.id === selectedStory.id)
        if (currentIndex < stories.length - 1) {
            // Mark current as viewed
            setStories(prev => prev.map(s => s.id === selectedStory.id ? { ...s, viewed: true } : s))
            setSelectedStory(stories[currentIndex + 1])
            setStoryProgress(0)
        } else {
            setSelectedStory(null)
            setStoryProgress(0)
        }
    }

    const goToPrevStory = () => {
        if (!selectedStory) return
        const currentIndex = stories.findIndex(s => s.id === selectedStory.id)
        if (currentIndex > 0) {
            setSelectedStory(stories[currentIndex - 1])
            setStoryProgress(0)
        }
    }

    // Add story
    const handleAddStory = () => {
        // For now, add a random travel image as a story
        const storyImages = [
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600',
            'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600',
            'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600'
        ]
        const newStory: Story = {
            id: `story-${Date.now()}`,
            userId: user?.id || 'unknown',
            image: storyImages[Math.floor(Math.random() * storyImages.length)],
            viewed: false
        }
        setStories(prev => [newStory, ...prev])
    }

    const handleCreatePost = () => {
        if (!newPostContent.trim() || !newPostTitle.trim()) return

        const newPost: CommunityPost = {
            id: `post-${Date.now()}`,
            userId: user?.id || 'unknown',
            tripId: null,
            title: newPostTitle,
            description: newPostContent,
            coverImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600',
            likes: 0,
            saves: 0,
            comments: [],
            tags: [],
            createdAt: new Date().toISOString()
        }

        setPosts(prev => [newPost, ...prev])
        setNewPostContent('')
        setNewPostTitle('')
        setShowCreatePost(false)

        // Save to localStorage
        const customPosts = JSON.parse(localStorage.getItem('community-posts') || '[]')
        localStorage.setItem('community-posts', JSON.stringify([newPost, ...customPosts]))
    }

    const getUser = (userId: string) => usersData.users.find(u => u.id === userId)
    const getCity = (cityId: string | number | undefined) => {
        if (!cityId) return undefined
        return cities.find(c => String(c.id) === String(cityId))
    }

    // Filter posts by tab
    const filteredPosts = selectedTab === 'trending'
        ? [...posts].sort((a, b) => b.likes - a.likes)
        : posts

    return (
        <div className="animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl shadow-lg">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Community</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Connect with travelers worldwide</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreatePost(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                    <PlusCircle className="w-5 h-5" />
                    Create Post
                </button>
            </div>

            {/* Stories */}
            <div className="mb-6 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-2">
                    {/* Add Story Button */}
                    <button onClick={handleAddStory} className="flex-shrink-0 flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-orange-400 transition-colors">
                            <PlusCircle className="w-6 h-6 text-gray-400" />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-slate-400">Add Story</span>
                    </button>

                    {/* Stories */}
                    {stories.map(story => {
                        const storyUser = getUser(story.userId)
                        return (
                            <button
                                key={story.id}
                                onClick={() => { setSelectedStory(story); setStoryProgress(0) }}
                                className="flex-shrink-0 flex flex-col items-center gap-1"
                            >
                                <div className={`w-16 h-16 rounded-full p-0.5 ${story.viewed ? 'bg-gray-300 dark:bg-slate-600' : 'bg-gradient-to-tr from-orange-500 to-rose-500'}`}>
                                    <img
                                        src={story.image}
                                        alt="Story"
                                        className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-800"
                                    />
                                </div>
                                <span className="text-xs text-gray-600 dark:text-slate-400 truncate max-w-[64px]">
                                    {storyUser?.firstName || 'User'}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-6 mb-6 border-b border-gray-200 dark:border-slate-700">
                {[
                    { id: 'feed', label: 'For You', icon: Globe },
                    { id: 'trending', label: 'Trending', icon: TrendingUp },
                    { id: 'following', label: 'Following', icon: Users },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
                        className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${selectedTab === tab.id
                            ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Feed */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Post */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </div>
                            <button
                                onClick={() => setShowCreatePost(true)}
                                className="flex-1 text-left px-4 py-2.5 bg-gray-100 dark:bg-slate-700 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                Share your travel story...
                            </button>
                            <button onClick={() => setShowCreatePost(true)} className="p-2 text-gray-400 hover:text-orange-500 transition-colors">
                                <Image className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Posts */}
                    {filteredPosts.map(post => {
                        const postUser = getUser(post.userId) || {
                            id: 'unknown',
                            firstName: 'Unknown',
                            lastName: 'User',
                            email: '',
                            image: null
                        }
                        const allComments = [...post.comments, ...(localComments[post.id] || [])]
                        const isLiked = likedPosts.includes(post.id)
                        const isSaved = savedPosts.includes(post.id)
                        // Ensure likes is a number
                        const currentLikes = typeof post.likes === 'number' ? post.likes : 0
                        const likeCount = currentLikes + (isLiked ? 1 : 0)

                        return (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden"
                            >
                                {/* Post Header */}
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full flex items-center justify-center text-white font-semibold">
                                            {postUser?.firstName?.[0]}{postUser?.lastName?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-dark-900 dark:text-white">
                                                {postUser?.firstName} {postUser?.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">
                                                {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                                        <MoreHorizontal className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>

                                {/* Post Image */}
                                {post.coverImage && (
                                    <div className="w-full overflow-hidden bg-gray-100 dark:bg-slate-700">
                                        <img
                                            src={post.coverImage}
                                            alt={post.title || "Post"}
                                            className="w-full h-auto max-h-[500px] object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none'
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Post Actions */}
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => toggleLike(post.id)}
                                                className="flex items-center gap-1 text-gray-600 dark:text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                            </button>
                                            <button
                                                onClick={() => setShowComments(post.id)}
                                                className="flex items-center gap-1 text-gray-600 dark:text-slate-400 hover:text-blue-500 transition-colors"
                                            >
                                                <MessageCircle className="w-6 h-6" />
                                            </button>
                                            <button
                                                onClick={() => setShowShare(post.id)}
                                                className="flex items-center gap-1 text-gray-600 dark:text-slate-400 hover:text-green-500 transition-colors"
                                            >
                                                <Share2 className="w-6 h-6" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => toggleSave(post.id)}
                                            className="text-gray-600 dark:text-slate-400 hover:text-orange-500 transition-colors"
                                        >
                                            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-orange-500 text-orange-500' : ''}`} />
                                        </button>
                                    </div>

                                    {/* Likes count */}
                                    <p className="font-semibold text-dark-900 dark:text-white mb-2">{likeCount.toLocaleString()} likes</p>

                                    {/* Title & Description */}
                                    <h3 className="font-semibold text-dark-900 dark:text-white mb-1">{post.title}</h3>
                                    <p className="text-dark-800 dark:text-slate-200 text-sm">{post.description}</p>

                                    {/* Tags */}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {post.tags.map(tag => (
                                                <span key={tag} className="text-xs text-orange-600 dark:text-orange-400">#{tag}</span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Comments preview */}
                                    {allComments.length > 0 && (
                                        <button
                                            onClick={() => setShowComments(post.id)}
                                            className="text-gray-500 dark:text-slate-400 text-sm mt-2 hover:text-gray-700"
                                        >
                                            View all {allComments.length} comments
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Trending Destinations */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                        <h3 className="font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-orange-500" />
                            Trending Destinations
                        </h3>
                        <div className="space-y-3">
                            {featuredDestinations.slice(0, 4).map((fd: any) => {
                                const city = getCity(fd.cityId || fd.city_id)
                                if (!city) return null
                                const cityImage = city.image || city.imageUrl || city.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'
                                return (
                                    <div key={fd.cityId || fd.city_id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                                        <img src={cityImage} alt={city.name} className="w-12 h-12 rounded-lg object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-dark-900 dark:text-white truncate">{city.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">{fd.reason}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Suggested Travelers */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                        <h3 className="font-semibold text-dark-900 dark:text-white mb-4">Suggested Travelers</h3>
                        <div className="space-y-3">
                            {usersData.users.filter(u => u.id !== user?.id).slice(0, 3).map(traveler => (
                                <div key={traveler.id} className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                        {traveler.firstName[0]}{traveler.lastName[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-dark-900 dark:text-white truncate">{traveler.firstName} {traveler.lastName}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">{traveler.city}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleFollow(traveler.id)}
                                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${followingUsers.includes(traveler.id)
                                            ? 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-300'
                                            : 'bg-orange-500 text-white hover:bg-orange-600'
                                            }`}
                                    >
                                        {followingUsers.includes(traveler.id) ? 'Following' : 'Follow'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Story Viewer Modal */}
            <AnimatePresence>
                {selectedStory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
                        onClick={() => setSelectedStory(null)}
                    >
                        {/* Progress Bar */}
                        <div className="absolute top-4 left-4 right-4 h-1 bg-white/30 rounded-full overflow-hidden">
                            <div className="h-full bg-white transition-all duration-100" style={{ width: `${storyProgress}%` }} />
                        </div>

                        {/* Story User */}
                        <div className="absolute top-8 left-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full p-0.5">
                                <img src={selectedStory.image} alt="" className="w-full h-full rounded-full object-cover" />
                            </div>
                            <span className="text-white font-medium">{getUser(selectedStory.userId)?.firstName}</span>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedStory(null)}
                            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Story Image */}
                        <img
                            src={selectedStory.image}
                            alt="Story"
                            className="max-h-[80vh] max-w-full object-contain rounded-xl"
                        />

                        {/* Navigation */}
                        <button
                            onClick={(e) => { e.stopPropagation(); goToPrevStory(); }}
                            className="absolute left-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); goToNextStory(); }}
                            className="absolute right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Comments Modal */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
                        onClick={() => setShowComments(null)}
                    >
                        <motion.div
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-slate-800 w-full sm:w-[480px] sm:rounded-2xl rounded-t-2xl max-h-[70vh] overflow-hidden"
                        >
                            <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                                <h3 className="font-semibold text-dark-900 dark:text-white">Comments</h3>
                                <button onClick={() => setShowComments(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-4 max-h-80 overflow-y-auto space-y-4">
                                {(() => {
                                    const post = posts.find(p => p.id === showComments)
                                    const allComments = [...(post?.comments || []), ...(localComments[showComments] || [])]

                                    if (allComments.length === 0) {
                                        return <p className="text-center text-gray-500 dark:text-slate-400 py-8">No comments yet. Be the first!</p>
                                    }

                                    return allComments.map(comment => {
                                        const commentUser = getUser(comment.userId)
                                        return (
                                            <div key={comment.id} className="flex gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-rose-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                                    {commentUser?.firstName?.[0]}{commentUser?.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm">
                                                        <span className="font-semibold text-dark-900 dark:text-white">{commentUser?.firstName} </span>
                                                        <span className="text-dark-800 dark:text-slate-200">{comment.text}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })
                                })()}
                            </div>

                            <div className="p-4 border-t border-gray-100 dark:border-slate-700 flex gap-3">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-full text-dark-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    onKeyPress={e => e.key === 'Enter' && showComments && addComment(showComments)}
                                />
                                <button
                                    onClick={() => showComments && addComment(showComments)}
                                    className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Share Modal */}
            <AnimatePresence>
                {showShare && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowShare(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm"
                        >
                            <h3 className="font-semibold text-dark-900 dark:text-white text-center mb-4">Share Post</h3>
                            <div className="grid grid-cols-4 gap-4">
                                {['Copy Link', 'WhatsApp', 'Twitter', 'Facebook'].map(platform => (
                                    <button
                                        key={platform}
                                        onClick={() => { navigator.clipboard.writeText(window.location.href); setShowShare(null) }}
                                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                            <Share2 className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                                        </div>
                                        <span className="text-xs text-gray-600 dark:text-slate-400">{platform}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Post Modal */}
            <AnimatePresence>
                {showCreatePost && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreatePost(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl"
                        >
                            <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                                <h3 className="font-semibold text-dark-900 dark:text-white">Create Post</h3>
                                <button onClick={() => setShowCreatePost(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-4">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full flex items-center justify-center text-white font-semibold">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-dark-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">Public</p>
                                    </div>
                                </div>

                                <input
                                    type="text"
                                    value={newPostTitle}
                                    onChange={e => setNewPostTitle(e.target.value)}
                                    placeholder="Post title..."
                                    className="w-full px-4 py-3 mb-3 bg-gray-50 dark:bg-slate-700 rounded-xl text-dark-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />

                                <textarea
                                    value={newPostContent}
                                    onChange={e => setNewPostContent(e.target.value)}
                                    placeholder="Share your travel experience..."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 rounded-xl text-dark-900 dark:text-white placeholder-gray-400 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />

                                <div className="flex items-center gap-3 mt-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                                    <span className="text-sm text-gray-500 dark:text-slate-400">Add to your post</span>
                                    <div className="flex gap-2 ml-auto">
                                        <button className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-green-500">
                                            <Image className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-red-500">
                                            <MapPin className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-100 dark:border-slate-700">
                                <button
                                    onClick={handleCreatePost}
                                    disabled={!newPostContent.trim() || !newPostTitle.trim()}
                                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                                >
                                    Post
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
