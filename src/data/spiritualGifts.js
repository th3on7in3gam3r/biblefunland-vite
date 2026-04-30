export const GIFT_PROFILES = {
  teaching: {
    id: 'teaching',
    name: 'Teaching',
    icon: '📖',
    color: '#3B82F6', // Blue
    scriptures: ['Romans 12:7', '1 Corinthians 12:28', 'James 3:1'],
    description:
      "The gift of Teaching is the divine ability to understand, clearly explain, and apply the truths of God's Word to the lives of listeners. Teachers have a thirst for knowledge and a deep desire to see others grow in theological and practical understanding.",
    actionSteps: [
      'Volunteer to lead a small group or Sunday School class.',
      'Start a Bible reading plan and share your insights with a friend.',
      'Consider writing devotionals or a blog sharing what you are learning.',
    ],
    ministries: [
      'Small Group Leadership',
      "Children's Church",
      'Youth Mentorship',
      'Discipleship Classes',
    ],
  },
  mercy: {
    id: 'mercy',
    name: 'Mercy',
    icon: '❤️',
    color: '#F43F5E', // Rose
    scriptures: ['Romans 12:8', 'Matthew 5:7', 'Luke 10:33-35'],
    description:
      'The gift of Mercy is the divine ability to feel genuine empathy and compassion for individuals who suffer distressing physical, mental, or emotional problems, and to translate that compassion into cheerful acts of service that alleviate suffering.',
    actionSteps: [
      'Look for the person sitting alone at church and invite them into conversation.',
      'Volunteer at a local shelter, food bank, or crisis center.',
      'Commit to visiting the elderly, shut-ins, or those in the hospital.',
    ],
    ministries: ['Care Ministry', 'Hospital Visitation', 'Meal Trains', 'Counseling Support'],
  },
  giving: {
    id: 'giving',
    name: 'Giving',
    icon: '🎁',
    color: '#10B981', // Emerald
    scriptures: ['Romans 12:8', '2 Corinthians 8:1-5', '2 Corinthians 9:7'],
    description:
      'The gift of Giving is the divine ability to contribute material resources to the work of the Lord with generosity, absolute cheerfulness, and high joy. Givers often manage their finances well so they can give abundantly.',
    actionSteps: [
      'Set up a dedicated fund in your budget strictly for spontaneous giving.',
      'Sponsor a child, a missionary, or a church plant.',
      'Look for financial needs within your immediate community and quietly meet them.',
    ],
    ministries: [
      'Stewardship Committee',
      'Missions Board',
      'Benevolence Fund',
      'Event Sponsorship',
    ],
  },
  administration: {
    id: 'administration',
    name: 'Administration',
    icon: '📋',
    color: '#8B5CF6', // Violet
    scriptures: ['1 Corinthians 12:28', 'Acts 6:1-7', 'Exodus 18:13-26'],
    description:
      'The gift of Administration is the divine ability to understand what makes an organization function, and the special ability to plan, organize, and execute procedures that accomplish the goals of the church effectively.',
    actionSteps: [
      'Offer to help coordinate upcoming church events or volunteer schedules.',
      'Look for inefficiencies in how your small group or ministries run and offer solutions.',
      'Assist church leaders with logistics so they can focus on teaching/pastoring.',
    ],
    ministries: [
      'Event Coordination',
      'Volunteer Management',
      'Church Office Team',
      'Finance Committee',
    ],
  },
  evangelism: {
    id: 'evangelism',
    name: 'Evangelism',
    icon: '📣',
    color: '#F59E0B', // Amber
    scriptures: ['Ephesians 4:11', 'Acts 8:5-6', 'Acts 21:8'],
    description:
      'The gift of Evangelism is the divine ability to confidently and effectively share the Gospel message with unbelievers in such a way that men and women become disciples of Jesus Christ. Evangelists naturally bridge conversations to eternal matters.',
    actionSteps: [
      'Pray daily for 3 specific people who do not know the Lord.',
      'Invite a coworker or neighbor out for coffee simply to hear their life story.',
      'Join an outreach program or community service team to meet unchurched people.',
    ],
    ministries: ['Community Outreach', 'Welcome Team', 'Missions Trips', 'Alpha Course Hosting'],
  },
  leadership: {
    id: 'leadership',
    name: 'Leadership',
    icon: '🦁',
    color: '#6366F1', // Indigo
    scriptures: ['Romans 12:8', '1 Timothy 5:17', 'Hebrews 13:17'],
    description:
      "The gift of Leadership is the divine ability to set goals in accordance with God's purpose for the future, and to communicate those goals to others in such a way that they harmoniously work together to accomplish them for the glory of God.",
    actionSteps: [
      'Identify a ministry gap in your church and propose a plan to fill it.',
      'Read books on Christian servant leadership and find a mentor.',
      'Disciple a younger believer, guiding them in their faith journey.',
    ],
    ministries: [
      'Ministry Director',
      'Eldership/Deacon Board',
      'Church Planting',
      'Strategic Planning',
    ],
  },
  serving: {
    id: 'serving',
    name: 'Serving',
    icon: '🤲',
    color: '#14B8A6', // Teal
    scriptures: ['Romans 12:7', 'Galatians 6:2', 'Mark 10:43-45'],
    description:
      'The gift of Serving (or Helps) is the divine ability to invest the talents one has in the life and ministry of other members of the body, thus enabling those others to increase the effectiveness of their own spiritual gifts.',
    actionSteps: [
      'Arrive early to church to help set up chairs or prepare coffee.',
      'Ask ministry leaders "What is the one task you dread doing?" and volunteer to do it.',
      'Join the facilities or cleaning team.',
    ],
    ministries: [
      'Setup/Tear Down Team',
      'Hospitality',
      'Tech/AV Support',
      'Facilities Maintenance',
    ],
  },
};

// 21 questions - 3 questions per gift
export const QUESTIONS = [
  {
    id: 1,
    gift: 'teaching',
    text: 'I enjoy spending hours researching and studying the Bible to discover deeper truths.',
  },
  {
    id: 2,
    gift: 'mercy',
    text: 'My heart breaks easily when I see others suffering or going through a difficult time.',
  },
  {
    id: 3,
    gift: 'giving',
    text: 'I routinely manage my money well so that I have the margin to give generously to others.',
  },
  {
    id: 4,
    gift: 'administration',
    text: 'I naturally see how to organize people, tasks, and resources to pull off an event flawlessly.',
  },
  {
    id: 5,
    gift: 'evangelism',
    text: 'I find it easy and natural to turn a regular conversation into a conversation about faith and Jesus.',
  },
  {
    id: 6,
    gift: 'leadership',
    text: 'I am comfortable casting a vision and asking others to follow me to achieve a common goal.',
  },
  {
    id: 7,
    gift: 'serving',
    text: 'I prefer to work quietly behind the scenes rather than being in the spotlight on a stage.',
  },
  {
    id: 8,
    gift: 'teaching',
    text: 'People often come to me when they are confused about a passage of scripture or theological concept.',
  },
  {
    id: 9,
    gift: 'mercy',
    text: 'I am drawn to visit people in the hospital, nursing homes, or prison just to sit with them.',
  },
  {
    id: 10,
    gift: 'giving',
    text: 'I experience incredible joy when I can financially support a missionary, church, or charity.',
  },
  {
    id: 11,
    gift: 'administration',
    text: 'I enjoy making lists, creating spreadsheets, and designing systems to make things run smoothly.',
  },
  {
    id: 12,
    gift: 'evangelism',
    text: 'I have a deep, heavy burden for the people in my city who do not know the Gospel.',
  },
  {
    id: 13,
    gift: 'leadership',
    text: 'When a group lacks direction, I naturally step up to guide them and delegate tasks.',
  },
  {
    id: 14,
    gift: 'serving',
    text: 'I enjoy doing routine, menial tasks if it means taking the burden off someone else.',
  },
  {
    id: 15,
    gift: 'teaching',
    text: 'I feel a strong responsibility to correct biblical misunderstandings or false theology when I hear it.',
  },
  {
    id: 16,
    gift: 'mercy',
    text: 'I tend to focus more on healing a person\'s emotional pain than trying to "fix" their practical problems right away.',
  },
  {
    id: 17,
    gift: 'giving',
    text: 'I believe everything I own belongs to God, and I am actively looking for ways to invest His money in the Kingdom.',
  },
  {
    id: 18,
    gift: 'administration',
    text: 'Details do not overwhelm me; I thrive on making sure nothing falls through the cracks.',
  },
  {
    id: 19,
    gift: 'evangelism',
    text: 'I am passionate about inviting people to church and introducing them to other believers.',
  },
  {
    id: 20,
    gift: 'leadership',
    text: 'People generally look to me for advice, direction, and decision-making during a crisis.',
  },
  {
    id: 21,
    gift: 'serving',
    text: 'I notice practical needs (like taking out the trash or folding chairs) and take care of them without being asked.',
  },
];
