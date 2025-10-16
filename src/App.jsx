import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Radio, Send, Users, UserCheck, UserX, Server, Activity } from 'lucide-react'
import './App.css'

const BACKEND_URL = 'https://discord-broadcast-bot-backend.onrender.com';

function App() {
  const [guilds, setGuilds] = useState([])
  const [selectedGuild, setSelectedGuild] = useState(null)
  const [guildStats, setGuildStats] = useState(null)
  const [targetGroup, setTargetGroup] = useState('all')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  // Fetch guilds on component mount
  useEffect(() => {
    fetchGuilds()
  }, [])

  // Fetch guild stats when a guild is selected
  useEffect(() => {
    if (selectedGuild) {
      fetchGuildStats(selectedGuild)
    }
  }, [selectedGuild])

  const fetchGuilds = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/broadcast/guilds`)
      const data = await response.json()
      if (data.guilds) {
        setGuilds(data.guilds)
        if (data.guilds.length > 0) {
          setSelectedGuild(data.guilds[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching guilds:', error)
      setStatus('خطأ في جلب قائمة السيرفرات')
    }
  }

  const fetchGuildStats = async (guildId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/broadcast/guild/${guildId}/stats`)
      const data = await response.json()
      setGuildStats(data)
    } catch (error) {
      console.error('Error fetching guild stats:', error)
    }
  }

  const handleSendBroadcast = async () => {
    if (!message.trim()) {
      setStatus('الرجاء كتابة رسالة')
      return
    }

    if (!selectedGuild) {
      setStatus('الرجاء اختيار سيرفر')
      return
    }

    setLoading(true)
    setStatus('جاري إرسال الرسائل...')

    try {
      const response = await fetch(`${BACKEND_URL}/api/broadcast/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guild_id: parseInt(selectedGuild),
          target_group: targetGroup,
          message: message,
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setStatus('تم إرسال الرسائل بنجاح! ✅')
        setMessage('')
      } else {
        setStatus(`خطأ: ${data.error}`)
      }
    } catch (error) {
      console.error('Error sending broadcast:', error)
      setStatus('حدث خطأ أثناء الإرسال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Radio className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              لوحة تحكم البرودكاست
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            أرسل رسائل جماعية لأعضاء سيرفر Discord بسهولة
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          {guildStats && (
            <>
              <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                    إجمالي الأعضاء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-blue-600">{guildStats.total_members}</p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UserCheck className="w-5 h-5 text-green-600" />
                    الأعضاء المتصلين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-green-600">{guildStats.online_members}</p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UserX className="w-5 h-5 text-gray-600" />
                    الأعضاء غير المتصلين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-gray-600">{guildStats.offline_members}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Control Panel */}
        <Card className="mt-6 border-2 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Server className="w-6 h-6 text-indigo-600" />
              إعدادات البرودكاست
            </CardTitle>
            <CardDescription>
              اختر السيرفر والمجموعة المستهدفة واكتب رسالتك
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Server Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">اختر السيرفر</label>
              <Select value={selectedGuild?.toString()} onValueChange={(value) => setSelectedGuild(parseInt(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر سيرفر" />
                </SelectTrigger>
                <SelectContent>
                  {guilds.map((guild) => (
                    <SelectItem key={guild.id} value={guild.id.toString()}>
                      {guild.name} ({guild.member_count} عضو)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Group Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">المجموعة المستهدفة</label>
              <Select value={targetGroup} onValueChange={setTargetGroup}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      جميع الأعضاء
                    </div>
                  </SelectItem>
                  <SelectItem value="online">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      الأعضاء المتصلين فقط
                    </div>
                  </SelectItem>
                  <SelectItem value="offline">
                    <div className="flex items-center gap-2">
                      <UserX className="w-4 h-4" />
                      الأعضاء غير المتصلين فقط
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">الرسالة</label>
              <Textarea
                placeholder="اكتب رسالتك هنا..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendBroadcast}
              disabled={loading || !message.trim()}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 animate-spin" />
                  جاري الإرسال...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  إرسال الرسائل
                </div>
              )}
            </Button>

            {/* Status Message */}
            {status && (
              <div className={`p-4 rounded-lg text-center font-medium animate-fade-in ${
                status.includes('خطأ') || status.includes('Error')
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {status}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            تأكد من تفعيل صلاحيات Members Intent و Presence Intent في إعدادات البوت
          </p>
        </div>
      </div>
    </div>
  )
}

export default App

