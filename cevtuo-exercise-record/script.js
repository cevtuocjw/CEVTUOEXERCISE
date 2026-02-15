// 全局变量
let currentLanguage = 'en';
let isAdmin = false;
// 硬编码当前日期为2026年2月15日（使用本地时间，确保北京时间一致性）
const today = new Date(2026, 1, 15);
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let exerciseData = JSON.parse(localStorage.getItem('exerciseData')) || {};

// 分页状态
let tableCurrentPage = 1;
let tableItemsPerPage = 15;
let timelineCurrentPage = 1;
let timelineItemsPerPage = 15;

// 存储原始头部操作内容
let originalHeaderActionsContent = '';

// 运动类型和术语（专业版）
const exerciseTypes = {
    zh: {
        skipping: '跳绳',
        dumbbellCurl: '哑铃前屈臂',
        dumbbellRow: '哑铃侧边单侧划船',
        running: '跑步',
        walking: '走路',
        sitUps: '仰卧起坐',
        skateboarding: '滑板',
        gluteBridge: '臀桥'
    },
    en: {
        skipping: 'Jump Rope',
        dumbbellCurl: 'Dumbbell Bicep Curl',
        dumbbellRow: 'Dumbbell One-Arm Row',
        running: 'Running',
        walking: 'Walking',
        sitUps: 'Sit-Ups',
        skateboarding: 'Skateboarding',
        gluteBridge: 'Glute Bridge'
    }
};

// 需要时长的运动类型
const durationTypes = ['skipping', 'skateboarding'];

// 翻译文本
const translations = {
    zh: {
        title: 'CEVTUO VE_Z EXERCISE RECORD',
        login: 'cjw登录',
        calendar: '日历看板',
        table: '数据表格',
        timeline: 'Timeline',
        statistics: '统计分析',
        adminLogin: 'cjw登录',
        password: '请输入密码',
        submit: '登录',
        addRecord: '添加记录',
        editRecord: '编辑记录',
        save: '保存',
        cancel: '取消',
        date: '日期',
        exercise: '运动项目',
        duration: '时长(分钟)',
        count: '数量',
        steps: '步数',
        distance: '距离(公里)',
        score: '评分',
        average: '平均值',
        total: '累计值',
        noData: '暂无数据',
        loginSuccess: '登录成功',
        loginFailed: '登录失败，请检查密码',
        recordAdded: '记录添加成功',
        recordUpdated: '记录更新成功',
        exportExcel: '导出',
        importExcel: '导入',
        uploadFile: '上传文件',
        confirmImport: '确认导入',
        today: '今天',
        dashboard: '数据概览',
        totalDays: '总运动天数',
        avgScore: '平均评分',
        totalDuration: '总运动时长',
        totalCount: '总运动次数'
    },
    en: {
        title: 'CEVTUO VE_Z EXERCISE RECORD',
        login: 'CJW Login',
        calendar: 'Calendar',
        table: 'Data Table',
        timeline: 'Timeline',
        statistics: 'Statistics',
        adminLogin: 'CJW Login',
        password: 'Please enter password',
        submit: 'Submit',
        addRecord: 'Add Record',
        editRecord: 'Edit Record',
        save: 'Save',
        cancel: 'Cancel',
        date: 'Date',
        exercise: 'Exercise',
        duration: 'Duration(min)',
        count: 'Count',
        steps: 'Steps',
        distance: 'Distance(km)',
        score: 'Score',
        average: 'Average',
        total: 'Total',
        noData: 'No data',
        loginSuccess: 'Login successful',
        loginFailed: 'Login failed, please check password',
        recordAdded: 'Record added successfully',
        recordUpdated: 'Record updated successfully',
        exportExcel: 'Export',
        importExcel: 'Import',
        uploadFile: 'Upload File',
        confirmImport: 'Confirm Import',
        today: 'Today',
        dashboard: 'Dashboard',
        totalDays: 'Total Days',
        avgScore: 'Average Score',
        totalDuration: 'Total Duration',
        totalCount: 'Total Count'
    }
};

// 初始化
function init() {
    // 存储原始头部操作内容（在绑定事件监听器之前）
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        originalHeaderActionsContent = headerActions.innerHTML;
        console.log('Original header actions stored:', originalHeaderActionsContent.length > 0);
    }
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 渲染页面
    renderPage();
    
    // 初始化横幅
    initBanner();
    
    // 更新今天的分数
    updateTodayScore();
    
    // 初始化滚动事件
    initScrollEvents();
}

// 生成单行动态导航链接
function generateHeaderNavigation() {
    const navItems = [
        { target: 'dashboard', label: translations[currentLanguage].dashboard },
        { target: 'calendar', label: translations[currentLanguage].calendar },
        { target: 'table', label: translations[currentLanguage].table },
        { target: 'timeline', label: translations[currentLanguage].timeline },
        { target: 'statistics', label: translations[currentLanguage].statistics }
    ];
    
    let html = `
        <div class="header-nav-container" style="display: flex; gap: 6px; align-items: center; flex-wrap: nowrap; justify-content: center; width: 100%;">
    `;
    
    navItems.forEach(item => {
        const isActive = document.querySelector(`.nav-btn[data-target="${item.target}"]`).classList.contains('active');
        html += `
            <button class="header-nav-btn ${isActive ? 'active' : ''}" data-target="${item.target}" style="
                padding: 2px 6px;
                border: 1px solid #000;
                background-color: ${isActive ? '#000' : 'transparent'};
                color: ${isActive ? '#fff' : '#000'};
                cursor: pointer;
                font-size: clamp(0.3rem, 0.5vw, 0.45rem);
                text-transform: uppercase;
                letter-spacing: 1px;
                white-space: nowrap;
                transition: all 0.3s ease;
                min-width: 40px;
                text-align: center;
                flex-shrink: 1;
                font-family: 'Helvetica Neue', Arial, sans-serif;
            ">
                ${item.label}
            </button>
        `;
    });
    
    html += `
        </div>
    `;
    
    return html;
}

// 节流函数
function throttle(func, delay) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, delay);
        }
    };
}

// 初始化滚动事件
function initScrollEvents() {
    // 获取DOM元素
    const header = document.querySelector('header');
    const navContainer = document.querySelector('.nav-container');
    const navToggle = document.getElementById('nav-toggle');
    const headerActions = document.querySelector('.header-actions');
    const svg = document.querySelector('svg');
    const mainTitle = document.querySelector('.main-title');
    
    // 隐藏原始头部操作
    if (headerActions) {
        headerActions.style.display = 'none';
    }
    
    // 隐藏原始导航栏
    if (navContainer) {
        navContainer.style.display = 'none';
    }
    
    // 创建侧边栏导航容器
    let sidebar = null;
    let sidebarOverlay = null;
    
    // 生成侧边栏导航
    function generateSidebar() {
        if (sidebar) {
            document.body.removeChild(sidebar);
        }
        if (sidebarOverlay) {
            document.body.removeChild(sidebarOverlay);
        }
        
        // 创建侧边栏
        sidebar = document.createElement('div');
        sidebar.className = 'sidebar';
        sidebar.style.cssText = `
            position: fixed;
            top: 0;
            right: -420px;
            width: 420px;
            height: 100vh;
            background-color: white;
            border-left: 1px solid #000;
            padding: 60px 40px;
            z-index: 1000;
            transition: right 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 30px;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            box-sizing: border-box;
        `;
        
        // 添加侧边栏标题
        const sidebarTitle = document.createElement('h3');
        sidebarTitle.textContent = 'Navigation';
        sidebarTitle.style.cssText = `
            font-size: 0.8rem;
            font-weight: 300;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin: 0 0 30px 0;
            text-align: left;
            padding-bottom: 20px;
            border-bottom: 1px solid #000;
        `;
        sidebar.appendChild(sidebarTitle);
        
        // 添加导航按钮
        const navItems = [
            { target: 'dashboard', label: translations[currentLanguage].dashboard },
            { target: 'calendar', label: translations[currentLanguage].calendar },
            { target: 'table', label: translations[currentLanguage].table },
            { target: 'timeline', label: translations[currentLanguage].timeline },
            { target: 'statistics', label: translations[currentLanguage].statistics }
        ];
        
        // 创建导航按钮容器
        const navContainer = document.createElement('div');
        navContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0;
            margin-bottom: 30px;
        `;
        
        navItems.forEach(item => {
            const btn = document.createElement('button');
            btn.textContent = item.label;
            btn.style.cssText = `
                padding: 15px 0;
                border: none;
                border-bottom: 1px solid #f0f0f0;
                background-color: transparent;
                cursor: pointer;
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 2px;
                transition: all 0.4s ease;
                text-align: left;
                font-weight: 300;
            `;
            
            btn.addEventListener('mouseover', function() {
                this.style.borderBottomColor = '#000';
                this.style.transform = 'translateX(8px)';
            });
            
            btn.addEventListener('mouseout', function() {
                this.style.borderBottomColor = '#f0f0f0';
                this.style.transform = 'translateX(0)';
            });
            
            btn.addEventListener('click', function() {
                showSection(item.target);
                closeSidebar();
            });
            
            navContainer.appendChild(btn);
        });
        
        sidebar.appendChild(navContainer);
        
        // 添加功能部分
        const functionSection = document.createElement('div');
        functionSection.style.cssText = `
            margin-top: 10px;
            padding-top: 30px;
            border-top: 1px solid #000;
        `;
        
        // 添加功能标题
        const functionTitle = document.createElement('h3');
        functionTitle.textContent = 'Functions';
        functionTitle.style.cssText = `
            font-size: 0.8rem;
            font-weight: 300;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin: 0 0 30px 0;
            text-align: left;
        `;
        functionSection.appendChild(functionTitle);
        
        // 添加语言切换
        const langContainer = document.createElement('div');
        langContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0;
            margin-bottom: 40px;
        `;
        
        const zhBtn = document.createElement('button');
        zhBtn.textContent = '中文';
        zhBtn.style.cssText = `
            padding: 12px 0;
            border: none;
            border-bottom: 1px solid #f0f0f0;
            background-color: ${currentLanguage === 'zh' ? 'black' : 'transparent'};
            color: ${currentLanguage === 'zh' ? 'white' : 'black'};
            cursor: pointer;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-align: left;
            transition: all 0.4s ease;
        `;
        zhBtn.addEventListener('mouseover', function() {
            this.style.borderBottomColor = '#000';
            this.style.transform = 'translateX(8px)';
        });
        zhBtn.addEventListener('mouseout', function() {
            this.style.borderBottomColor = '#f0f0f0';
            this.style.transform = 'translateX(0)';
        });
        zhBtn.addEventListener('click', function() {
            switchLanguage('zh');
            generateSidebar();
            openSidebar();
        });
        langContainer.appendChild(zhBtn);
        
        const enBtn = document.createElement('button');
        enBtn.textContent = 'English';
        enBtn.style.cssText = `
            padding: 12px 0;
            border: none;
            border-bottom: 1px solid #f0f0f0;
            background-color: ${currentLanguage === 'en' ? 'black' : 'transparent'};
            color: ${currentLanguage === 'en' ? 'white' : 'black'};
            cursor: pointer;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-align: left;
            transition: all 0.4s ease;
        `;
        enBtn.addEventListener('mouseover', function() {
            this.style.borderBottomColor = '#000';
            this.style.transform = 'translateX(8px)';
        });
        enBtn.addEventListener('mouseout', function() {
            this.style.borderBottomColor = '#f0f0f0';
            this.style.transform = 'translateX(0)';
        });
        enBtn.addEventListener('click', function() {
            switchLanguage('en');
            generateSidebar();
            openSidebar();
        });
        langContainer.appendChild(enBtn);
        functionSection.appendChild(langContainer);
        
        // 添加登录按钮
        const loginBtn = document.createElement('button');
        loginBtn.textContent = isAdmin ? 'Logout' : 'CJW Login';
        loginBtn.style.cssText = `
            padding: 12px 0;
            border: none;
            border-bottom: 1px solid #f0f0f0;
            background-color: transparent;
            cursor: pointer;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-align: left;
            transition: all 0.4s ease;
            display: block;
            width: 100%;
            box-sizing: border-box;
        `;
        loginBtn.addEventListener('mouseover', function() {
            this.style.borderBottomColor = '#000';
            this.style.transform = 'translateX(8px)';
        });
        loginBtn.addEventListener('mouseout', function() {
            this.style.borderBottomColor = '#f0f0f0';
            this.style.transform = 'translateX(0)';
        });
        loginBtn.addEventListener('click', function() {
            if (isAdmin) {
                logout();
                generateSidebar();
                openSidebar();
            } else {
                document.getElementById('login-modal').style.display = 'block';
                closeSidebar();
            }
        });
        functionSection.appendChild(loginBtn);
        
        // 添加Today's Data按钮
        const todayBtn = document.createElement('button');
        todayBtn.textContent = currentLanguage === 'zh' ? '今日数据' : 'Today\'s Data';
        todayBtn.style.cssText = `
            padding: 12px 0;
            border: none;
            border-bottom: 1px solid #f0f0f0;
            background-color: transparent;
            cursor: pointer;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-align: left;
            transition: all 0.4s ease;
            display: block;
            width: 100%;
            box-sizing: border-box;
        `;
        todayBtn.addEventListener('mouseover', function() {
            this.style.borderBottomColor = '#000';
            this.style.transform = 'translateX(8px)';
        });
        todayBtn.addEventListener('mouseout', function() {
            this.style.borderBottomColor = '#f0f0f0';
            this.style.transform = 'translateX(0)';
        });
        todayBtn.addEventListener('click', function() {
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            if (isAdmin) {
                showEditForm(todayStr);
            } else {
                // 非管理员只能查看
                const record = exerciseData[todayStr];
                if (record) {
                    const dateModal = document.getElementById('date-modal');
                    const dateModalTitle = document.getElementById('date-modal-title');
                    const dateModalContent = document.getElementById('date-modal-content');
                    const editDateBtn = document.getElementById('edit-date-btn');
                    
                    dateModalTitle.textContent = todayStr;
                    
                    // 生成日期模态框内容
                    let content = '';
                    content += `<div class="date-record">`;
                    
                    // 添加跳绳数据
                    if (record.skipping.duration || record.skipping.count) {
                        content += `<div class="save-item"><strong>${exerciseTypes[currentLanguage].skipping}:</strong> `;
                        if (record.skipping.duration) content += `${record.skipping.duration} ${currentLanguage === 'zh' ? '分钟' : 'minutes'}`;
                        if (record.skipping.count) content += `, ${record.skipping.count} ${currentLanguage === 'zh' ? '个' : 'ropes'}`;
                        content += `</div>`;
                    }
                    
                    // 添加其他运动数据
                    Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
                        if (type !== 'skipping' && type !== 'skateboarding') {
                            if (record[type] && record[type].count) {
                                content += `<div class="save-item"><strong>${exerciseTypes[currentLanguage][type]}:</strong> ${record[type].count} ${type === 'walking' ? (currentLanguage === 'zh' ? '步' : 'steps') : (currentLanguage === 'zh' ? '次' : 'times')}</div>`;
                            }
                        }
                    });
                    
                    // 添加滑板数据
                    if (record.skateboarding.duration || record.skateboarding.count) {
                        content += `<div class="save-item"><strong>${exerciseTypes[currentLanguage].skateboarding}:</strong> `;
                        if (record.skateboarding.duration) content += `${record.skateboarding.duration} ${currentLanguage === 'zh' ? '分钟' : 'minutes'}`;
                        if (record.skateboarding.count) content += `, ${record.skateboarding.count} ${currentLanguage === 'zh' ? '次' : 'times'}`;
                        content += `</div>`;
                    }
                    
                    // 添加评分
                    if (record.score) {
                        content += `<div class="save-item"><strong>${translations[currentLanguage].score}:</strong> ${record.score}/100</div>`;
                    }
                    
                    content += `</div>`;
                    
                    dateModalContent.innerHTML = content;
                    editDateBtn.style.display = 'none'; // 隐藏编辑按钮
                    dateModal.style.display = 'block';
                } else {
                    alert('No data for today');
                }
            }
            closeSidebar();
        });
        functionSection.appendChild(todayBtn);
        
        // 添加Excel按钮
        if (isAdmin) {
            const excelContainer = document.createElement('div');
            excelContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 0;
                margin-bottom: 40px;
            `;
            
            const exportBtn = document.createElement('button');
            exportBtn.textContent = currentLanguage === 'zh' ? '导出' : 'Export';
            exportBtn.style.cssText = `
                padding: 12px 0;
                border: none;
                border-bottom: 1px solid #f0f0f0;
                background-color: transparent;
                cursor: pointer;
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 2px;
                text-align: left;
                transition: all 0.4s ease;
            `;
            exportBtn.addEventListener('mouseover', function() {
                this.style.borderBottomColor = '#000';
                this.style.transform = 'translateX(8px)';
            });
            exportBtn.addEventListener('mouseout', function() {
                this.style.borderBottomColor = '#f0f0f0';
                this.style.transform = 'translateX(0)';
            });
            exportBtn.addEventListener('click', function() {
                exportExcel();
                closeSidebar();
            });
            excelContainer.appendChild(exportBtn);
            
            const importBtn = document.createElement('button');
            importBtn.textContent = currentLanguage === 'zh' ? '导入' : 'Import';
            importBtn.style.cssText = `
                padding: 12px 0;
                border: none;
                border-bottom: 1px solid #f0f0f0;
                background-color: transparent;
                cursor: pointer;
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 2px;
                text-align: left;
                transition: all 0.4s ease;
            `;
            importBtn.addEventListener('mouseover', function() {
                this.style.borderBottomColor = '#000';
                this.style.transform = 'translateX(8px)';
            });
            importBtn.addEventListener('mouseout', function() {
                this.style.borderBottomColor = '#f0f0f0';
                this.style.transform = 'translateX(0)';
            });
            importBtn.addEventListener('click', function() {
                document.getElementById('import-modal').style.display = 'block';
                closeSidebar();
            });
            excelContainer.appendChild(importBtn);
            functionSection.appendChild(excelContainer);
        }
        
        // 添加关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.cssText = `
            padding: 20px 0;
            border: 1px solid #000;
            background-color: #000;
            color: white;
            cursor: pointer;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 3px;
            text-align: center;
            transition: all 0.4s ease;
            margin-top: 40px;
            display: block;
            width: 100%;
            box-sizing: border-box;
        `;
        closeBtn.addEventListener('mouseover', function() {
            this.style.backgroundColor = 'transparent';
            this.style.color = '#000';
        });
        closeBtn.addEventListener('mouseout', function() {
            this.style.backgroundColor = '#000';
            this.style.color = 'white';
        });
        closeBtn.addEventListener('click', closeSidebar);
        functionSection.appendChild(closeBtn);
        
        sidebar.appendChild(functionSection);
        document.body.appendChild(sidebar);
        
        // 添加遮罩层
        sidebarOverlay = document.createElement('div');
        sidebarOverlay.className = 'sidebar-overlay';
        sidebarOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.6s ease, visibility 0.6s ease;
        `;
        sidebarOverlay.addEventListener('click', closeSidebar);
        document.body.appendChild(sidebarOverlay);
        
        // 打开侧边栏
        openSidebar();
    }
    
    // 打开侧边栏
    function openSidebar() {
        if (sidebar && sidebarOverlay) {
            sidebar.style.right = '0';
            sidebarOverlay.style.opacity = '1';
            sidebarOverlay.style.visibility = 'visible';
            document.body.style.overflow = 'hidden';
        }
    }
    
    // 关闭侧边栏
    function closeSidebar() {
        if (sidebar && sidebarOverlay) {
            sidebar.style.right = '-420px';
            sidebarOverlay.style.opacity = '0';
            sidebarOverlay.style.visibility = 'hidden';
            document.body.style.overflow = '';
        }
    }
    
    // 应用头部状态
    function applyHeaderState() {
        // 保持头部为sticky位置
        if (header) {
            header.style.position = 'sticky';
            header.style.top = '0';
            header.style.left = '0';
            header.style.right = '0';
            header.style.zIndex = '100';
        }
    }
    
    // 绑定MENU按钮事件
    if (navToggle) {
        navToggle.addEventListener('click', generateSidebar);
    }
    
    // 响应式处理
    function handleResponsive() {
        const windowWidth = window.innerWidth;
        
        // 当窗口缩窄时，调整布局
        if (windowWidth < 768) {
            // 缩小SVG
            if (svg) {
                svg.style.width = '60px';
                svg.style.height = '60px';
            }
            
            // 缩小标题字体
            if (mainTitle) {
                mainTitle.style.fontSize = 'clamp(0.8rem, 3vw, 1.5rem)';
            }
        } else {
            // 恢复SVG大小
            if (svg) {
                svg.style.width = '80px';
                svg.style.height = '80px';
            }
            
            // 恢复标题字体
            if (mainTitle) {
                mainTitle.style.fontSize = 'clamp(1rem, 3.5vw, 2.2rem)';
            }
        }
    }
    
    // 初始化响应式处理
    handleResponsive();
    window.addEventListener('resize', handleResponsive);
    
    // 节流处理滚动事件
    window.addEventListener('scroll', throttle(function() {
        applyHeaderState();
    }, 100)); // 100ms节流延迟
    
    // 确保页面加载时初始化正确的头部状态
    window.addEventListener('load', function() {
        applyHeaderState();
    });
    
    // 确保初始化时应用正确的头部状态
    applyHeaderState();
    
    // 初始化浮动logo
    initFloatingLogo();
}

// 初始化浮动logo
function initFloatingLogo() {
    const logo = document.getElementById('floating-logo');
    if (!logo) return;
    
    // 获取logo原始宽高
    const originalWidth = 80;
    const originalHeight = 80;
    const aspectRatio = originalWidth / originalHeight;
    
    // 确保logo是固定定位，初始无动画
    logo.style.position = 'fixed';
    logo.style.left = '50%';
    logo.style.top = '50%';
    logo.style.opacity = '1';
    logo.style.zIndex = '101';
    logo.style.cursor = 'pointer';
    logo.style.transition = 'none'; // 初始无动画
    logo.style.pointerEvents = 'auto';
    
    // 确保动画立即执行
    logo.clientWidth; // 触发重排
    
    // 计算动画大小
    const calculateSizes = () => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const narrowSide = Math.min(windowWidth, windowHeight);
        
        return {
            startSize: narrowSide * 0.2, // 页面窄边的1/5
            maxSize: narrowSide * 0.5, // 页面窄边的1/2
            normalSize: originalWidth * 1.5 // 平常大小是现在的1.5倍大
        };
    };
    
    const sizes = calculateSizes();
    
    // 设置初始大小
    logo.style.transform = `translate(-50%, -50%) scale(${sizes.startSize / originalWidth})`;
    logo.clientWidth; // 触发重排
    
    // 页面加载动画 - 从1/5扩大到1/2
    setTimeout(() => {
        // 先设置过渡效果
        logo.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        // 触发重排
        logo.clientWidth;
        // 然后设置变换到最大大小
        logo.style.transform = `translate(-50%, -50%) scale(${sizes.maxSize / originalWidth})`;
        
        // 动画完成后迅速缩小到平常大小
        setTimeout(() => {
            // 先设置过渡效果
            logo.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            // 触发重排
            logo.clientWidth;
            // 然后设置变换到平常大小
            logo.style.transform = `translate(-50%, -50%) scale(${sizes.normalSize / originalWidth})`;
            
            // 动画完成后开始随机游走
            setTimeout(() => {
                startFloating();
            }, 500);
        }, 1000);
    }, 100);
    
    // 点击logo打开menu
    logo.addEventListener('click', function() {
        console.log('Logo clicked');
        const navToggle = document.getElementById('nav-toggle');
        if (navToggle) {
            navToggle.click();
        }
    });
    
    // 随机游走函数
    function startFloating() {
        const moveLogo = () => {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            // 计算当前logo大小
            const currentScale = sizes.normalSize / originalWidth;
            // 考虑旋转的影响，使用更大的边界
            const logoWidth = originalWidth * currentScale * 1.414; // 乘以√2以考虑旋转
            const logoHeight = originalHeight * currentScale * 1.414;
            
            // 随机目标位置，确保logo完全在页面内
            const targetX = Math.random() * (windowWidth - logoWidth);
            const targetY = Math.random() * (windowHeight - logoHeight);
            
            // 随机旋转角度
            const targetRotation = Math.random() * 360;
            
            // 随机移动时间
            const duration = 3000 + Math.random() * 4000;
            
            console.log('Moving logo to:', targetX, targetY, 'rotation:', targetRotation, 'duration:', duration);
            
            // 应用过渡效果
            logo.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            // 触发重排
            logo.clientWidth;
            // 设置新位置和旋转
            logo.style.left = `${targetX}px`;
            logo.style.top = `${targetY}px`;
            logo.style.transform = `translate(0, 0) rotate(${targetRotation}deg) scale(${currentScale})`;
            
            // 递归调用，继续游走
            setTimeout(moveLogo, duration);
        };
        
        // 开始游走
        moveLogo();
    }
}

// 绑定事件监听器
function bindEventListeners() {
    // 语言切换
    document.getElementById('zh-btn').addEventListener('click', () => switchLanguage('zh'));
    document.getElementById('en-btn').addEventListener('click', () => switchLanguage('en'));
    
    // 回到顶部按钮
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // 登录按钮
    document.getElementById('login-btn').addEventListener('click', () => {
        if (isAdmin) {
            // 已经登录，显示提示
            alert('您已经登录了');
        } else {
            // 未登录，显示登录模态框
            document.getElementById('login-modal').style.display = 'block';
        }
    });

    
    // 关闭登录模态框
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modal = closeBtn.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (e.target == modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // 登录提交
    document.getElementById('submit-login').addEventListener('click', submitLogin);
    
    // 密码输入框回车键登录
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitLogin();
        }
    });
    
    // Excel按钮
    const exportExcelBtn = document.getElementById('export-excel');
    const importExcelBtn = document.getElementById('import-excel');
    const confirmImportBtn = document.getElementById('confirm-import');
    const cancelImportBtn = document.getElementById('cancel-import');
    const excelFileInput = document.getElementById('excel-file');
    
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', exportExcel);
    }
    
    if (importExcelBtn) {
        importExcelBtn.addEventListener('click', () => {
            if (!isAdmin) {
                alert('不是CJW，不能上传和下载');
                return;
            }
            document.getElementById('import-modal').style.display = 'block';
        });
    }
    
    if (confirmImportBtn) {
        confirmImportBtn.addEventListener('click', importExcel);
    }
    
    if (cancelImportBtn) {
        cancelImportBtn.addEventListener('click', () => {
            document.getElementById('import-modal').style.display = 'none';
            // Reset form
            if (excelFileInput) {
                excelFileInput.value = '';
                document.getElementById('file-name').textContent = '点击上传Excel文件';
            }
            document.getElementById('import-preview').style.display = 'none';
            document.getElementById('error-message').style.display = 'none';
        });
    }
    
    if (excelFileInput) {
        excelFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                document.getElementById('file-name').textContent = file.name;
                // Show preview if file is selected
                showImportPreview(file);
            } else {
                document.getElementById('file-name').textContent = '点击上传Excel文件';
                document.getElementById('import-preview').style.display = 'none';
            }
        });
    }
    
    // 导航按钮
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            showSection(target);
        });
    });
    
    // 登出按钮
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // 今天的数据按钮
    document.getElementById('today-btn').addEventListener('click', () => {
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        if (isAdmin) {
            showEditForm(todayStr);
        } else {
            // 非管理员只能查看，不能编辑
            const record = exerciseData[todayStr];
            if (record) {
                // 显示日期模态框
                const dateModal = document.getElementById('date-modal');
                const dateModalTitle = document.getElementById('date-modal-title');
                const dateModalContent = document.getElementById('date-modal-content');
                const editDateBtn = document.getElementById('edit-date-btn');
                
                dateModalTitle.textContent = todayStr;
                
                // 生成日期模态框内容
                let content = '';
                content += `<div class="date-record">`;
                
                // 添加跳绳数据
                if (record.skipping.duration || record.skipping.count) {
                    content += `<div class="save-item"><strong>${exerciseTypes[currentLanguage].skipping}:</strong> `;
                    if (record.skipping.duration) content += `${record.skipping.duration} ${currentLanguage === 'zh' ? '分钟' : 'minutes'}`;
                    if (record.skipping.count) content += `, ${record.skipping.count} ${currentLanguage === 'zh' ? '个' : 'ropes'}`;
                    content += `</div>`;
                }
                
                // 添加其他运动数据
                Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
                    if (type !== 'skipping' && type !== 'skateboarding') {
                        if (record[type] && record[type].count) {
                            content += `<div class="save-item"><strong>${exerciseTypes[currentLanguage][type]}:</strong> ${record[type].count} ${type === 'walking' ? (currentLanguage === 'zh' ? '步' : 'steps') : (currentLanguage === 'zh' ? '次' : 'times')}</div>`;
                        }
                    }
                });
                
                // 添加滑板数据
                if (record.skateboarding.duration || record.skateboarding.count) {
                    content += `<div class="save-item"><strong>${exerciseTypes[currentLanguage].skateboarding}:</strong> `;
                    if (record.skateboarding.duration) content += `${record.skateboarding.duration} ${currentLanguage === 'zh' ? '分钟' : 'minutes'}`;
                    if (record.skateboarding.count) content += `, ${record.skateboarding.count} ${currentLanguage === 'zh' ? '次' : 'times'}`;
                    content += `</div>`;
                }
                
                // 添加评分
                if (record.score) {
                    content += `<div class="save-item"><strong>${translations[currentLanguage].score}:</strong> ${record.score}/100</div>`;
                }
                
                content += `</div>`;
                
                dateModalContent.innerHTML = content;
                editDateBtn.style.display = 'none'; // 隐藏编辑按钮
                dateModal.style.display = 'block';
            } else {
                alert('No data for today');
            }
        }
    });
    
    // 关闭保存模态框
    document.getElementById('close-save-modal').addEventListener('click', () => {
        document.getElementById('save-modal').style.display = 'none';
    });
    
    // 关闭日期模态框
    document.getElementById('close-date-modal').addEventListener('click', () => {
        document.getElementById('date-modal').style.display = 'none';
    });
    
    // 编辑日期数据
    document.getElementById('edit-date-btn').addEventListener('click', () => {
        const date = document.getElementById('date-modal-title').textContent;
        document.getElementById('date-modal').style.display = 'none';
        showEditForm(date);
    });
}

// 切换语言
function switchLanguage(lang) {
    currentLanguage = lang;
    
    // 更新语言按钮状态
    document.getElementById('zh-btn').classList.toggle('active', lang === 'zh');
    document.getElementById('en-btn').classList.toggle('active', lang === 'en');
    
    // 重新渲染页面
    renderPage();
}

// 登出函数
function logout() {
    isAdmin = false;
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const exportExcelBtn = document.getElementById('export-excel');
    const importExcelBtn = document.getElementById('import-excel');
    
    if (loginBtn) {
        loginBtn.style.display = 'inline-block';
    }
    
    if (logoutBtn) {
        logoutBtn.style.display = 'none';
    }
    
    if (exportExcelBtn) {
        exportExcelBtn.style.display = 'none';
    }
    
    if (importExcelBtn) {
        importExcelBtn.style.display = 'none';
    }
    
    // 重新渲染页面，确保所有UI状态都更新
    renderPage();
    
    alert(translations[currentLanguage].logoutSuccess || '登出成功');

}

// 渲染页面
function renderPage() {
    // 更新标题
    document.querySelector('header h1').textContent = translations[currentLanguage].title;
    
    // 更新导航
    document.querySelectorAll('.nav-btn').forEach((btn, index) => {
        const targets = ['dashboard', 'calendar', 'table', 'timeline', 'statistics'];
        const translationsKeys = ['dashboard', 'calendar', 'table', 'timeline', 'statistics'];
        btn.textContent = translations[currentLanguage][translationsKeys[index]];
    });
    
    // 更新登录/登出按钮
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const todayBtn = document.getElementById('today-btn');
    const exportExcelBtn = document.getElementById('export-excel');
    const importExcelBtn = document.getElementById('import-excel');
    
    if (loginBtn && logoutBtn) {
        if (isAdmin) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            if (exportExcelBtn) exportExcelBtn.style.display = 'inline-block';
            if (importExcelBtn) importExcelBtn.style.display = 'inline-block';
        } else {
            loginBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
            if (exportExcelBtn) exportExcelBtn.style.display = 'none';
            if (importExcelBtn) importExcelBtn.style.display = 'none';
        }
    }
    
    // 更新Today's Data按钮文本
    if (todayBtn) {
        todayBtn.textContent = currentLanguage === 'zh' ? '今日数据' : 'Today\'s Data';
    }
    
    // 更新登出按钮文本
    if (logoutBtn) {
        logoutBtn.textContent = currentLanguage === 'zh' ? '登出' : 'Logout';
    }
    
    // 更新登录模态框文本
    const loginModalTitle = document.getElementById('login-modal-title');
    const passwordInput = document.getElementById('password');
    const submitLoginBtn = document.getElementById('submit-login');
    
    if (loginModalTitle && passwordInput && submitLoginBtn) {
        loginModalTitle.textContent = currentLanguage === 'zh' ? 'cjw登录' : 'cjw Login';
        passwordInput.placeholder = currentLanguage === 'zh' ? '请输入密码' : 'Please enter password';
        submitLoginBtn.textContent = currentLanguage === 'zh' ? '登录' : 'Login';
    }
    
    // 更新Excel按钮文本
    if (isAdmin) {
        updateExcelButtonText();
    }
    
    // 渲染当前激活的部分
    const activeSection = document.querySelector('.section.active').id;
    renderSection(activeSection);
    
    // 检查是否有保存的图片，如果有就显示
    const savedImage = localStorage.getItem('savedImage');
    if (savedImage) {
        setTimeout(() => {
            // 显示图片上传和查看块
            const imageUploadSection = document.getElementById('image-upload-section');
            if (imageUploadSection) {
                imageUploadSection.style.display = 'block';
                console.log('Image upload section displayed');
            }
            
            // 加载保存的图片
            loadSavedImage();
            
            // 如果用户已经登录，初始化图片上传功能
            if (isAdmin) {
                initImageUpload();
            }
        }, 200);
    } else if (isAdmin) {
        // 如果用户已经登录但没有保存的图片，显示图片上传块并初始化功能
        setTimeout(() => {
            // 显示图片上传和查看块
            const imageUploadSection = document.getElementById('image-upload-section');
            if (imageUploadSection) {
                imageUploadSection.style.display = 'block';
                console.log('Image upload section displayed');
            }
            
            // 初始化图片上传功能
            initImageUpload();
        }, 200);
    }
}

// 显示指定部分
function showSection(target) {
    // 更新导航按钮状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-target') === target);
    });
    
    // 更新部分显示
    document.querySelectorAll('.section').forEach(section => {
        section.classList.toggle('active', section.id === target);
    });
    
    // 渲染部分内容
    renderSection(target);
}

// 渲染指定部分
function renderSection(sectionId) {
    switch (sectionId) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'calendar':
            renderCalendar();
            break;
        case 'table':
            renderTable();
            break;
        case 'timeline':
            renderTimeline();
            break;
        case 'statistics':
            renderStatistics();
            break;
    }
}

// 渲染日历
function renderCalendar() {
    const container = document.querySelector('.calendar-container');
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // 生成日历HTML
    const monthName = currentLanguage === 'zh' ? `${currentYear}年${currentMonth + 1}月` : `${currentMonth + 1}/${currentYear}`;
    const weekdays = currentLanguage === 'zh' ? ['日', '一', '二', '三', '四', '五', '六'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    let html = `
        <div class="calendar-header">
            <h3>${monthName}</h3>
            <div class="calendar-nav">
                <button onclick="goToToday()">${translations[currentLanguage].today || 'Today'}</button>
                <button onclick="changeMonth(-1)">‹</button>
                <button onclick="changeMonth(1)">›</button>
            </div>
        </div>
        <div class="calendar-grid">
    `;
    
    // 添加星期标题
    weekdays.forEach(day => {
        html += `<div class="calendar-weekday">${day}</div>`;
    });
    
    // 生成日期
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        // 使用本地时间生成日期字符串，确保北京时间一致性
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const hasData = exerciseData[dateStr] !== undefined;
        // 使用本地时间比较，确保北京时间一致性
        const todayYear = today.getFullYear();
        const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
        const todayDay = String(today.getDate()).padStart(2, '0');
        const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;
        const isToday = dateStr === todayStr;
        const isCurrentMonth = date.getMonth() === currentMonth;
        
        html += `
            <div class="calendar-day ${hasData ? 'has-data' : ''} ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}" 
                 onclick="selectDate('${dateStr}')">
                ${date.getDate()}
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// 切换月份
function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

// 回到今天
function goToToday() {
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();
    renderCalendar();
}

// 选择日期
function selectDate(dateStr) {
    const record = exerciseData[dateStr];
    
    // 生成日期模态框内容
    let content = '';
    
    if (record) {
        content += `<div class="date-record">`;
        
        // 添加跳绳数据
        if (record.skipping.duration || record.skipping.count) {
            content += `<div class="save-item"><strong>${exerciseTypes[currentLanguage].skipping}:</strong> `;
            if (record.skipping.duration) content += `${record.skipping.duration} ${currentLanguage === 'zh' ? '分钟' : 'minutes'}`;
            if (record.skipping.count) content += `, ${record.skipping.count} ${currentLanguage === 'zh' ? '次' : 'times'}`;
            content += `</div>`;
        }
        
        // 添加其他运动数据
        Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
            if (type !== 'skipping' && type !== 'skateboarding') {
                if (record[type] && record[type].count) {
                    content += `<div class="save-item"><strong>${exerciseTypes[currentLanguage][type]}:</strong> ${record[type].count} ${currentLanguage === 'zh' ? '次' : 'times'}</div>`;
                }
            }
        });
        
        // 添加滑板数据
        if (record.skateboarding.duration || record.skateboarding.count) {
            content += `<div class="save-item"><strong>${exerciseTypes[currentLanguage].skateboarding}:</strong> `;
            if (record.skateboarding.duration) content += `${record.skateboarding.duration} ${currentLanguage === 'zh' ? '分钟' : 'minutes'}`;
            if (record.skateboarding.count) content += `, ${record.skateboarding.count} ${currentLanguage === 'zh' ? '次' : 'times'}`;
            content += `</div>`;
        }
        
        // 添加评分
        if (record.score) {
            content += `<div class="save-item"><strong>${translations[currentLanguage].score}:</strong> ${record.score}/100</div>`;
        }
        
        content += `</div>`;
    } else {
        content += `<div class="permission-alert">
            <h4>${translations[currentLanguage].noData || 'No data'}</h4>
            <p>${translations[currentLanguage].noRecord || 'No record for this date'}</p>
        </div>`;
    }
    
    // 更新日期模态框
    document.getElementById('date-modal-title').textContent = dateStr;
    document.getElementById('date-modal-content').innerHTML = content;
    
    // 显示或隐藏编辑按钮
    if (isAdmin) {
        document.getElementById('edit-date-btn').style.display = 'inline-block';
    } else {
        document.getElementById('edit-date-btn').style.display = 'none';
    }
    
    // 显示日期模态框
    document.getElementById('date-modal').style.display = 'block';
}

// 显示编辑表单
function showEditForm(dateStr) {
    // 检查是否为管理员
    if (!isAdmin) {
        const isCjw = confirm('您是否为cjw？只有cjw可以修改数据。');
        if (!isCjw) {
            alert('您没有权限修改数据。');
            return;
        }
    }
    
    const record = exerciseData[dateStr] || {
        date: dateStr,
        skipping: { duration: '', count: '' },
        dumbbellCurl: { count: '' },
        dumbbellRow: { count: '' },
        running: { count: '' },
        walking: { count: '' },
        sitUps: { count: '' },
        skateboarding: { duration: '', count: '' },
        gluteBridge: { count: '' },
        score: ''
    };
    
    // 检查是否已存在编辑模态框，如果存在则移除
    const existingModal = document.getElementById('edit-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 创建编辑模态框
    let html = `
        <div id="edit-modal" class="modal">
            <div class="modal-content" style="width: 90%; max-width: 800px; max-height: 80vh; overflow-y: auto;">
                <span class="close">&times;</span>
                <h2>${record.date ? translations[currentLanguage].editRecord : translations[currentLanguage].addRecord}</h2>
                <form id="exercise-form">
                    <input type="hidden" name="date" value="${dateStr}">
                    <div class="form-grid">
    `;
    
    // 添加运动项目表单
    Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
        html += `
            <div class="exercise-section">
                <h4>${exerciseTypes[currentLanguage][type]}</h4>
        `;
        
        // 只对跳绳和滑板显示时长字段
        if (durationTypes.includes(type)) {
            html += `
                <div class="form-group">
                    <label>${translations[currentLanguage].duration}</label>
                    <input type="number" name="${type}-duration" value="${record[type]?.duration || ''}" min="0" step="0.5">
                </div>
            `;
        }
        
        // 对所有运动显示数量字段
        html += `
                <div class="form-group">
                    <label>${translations[currentLanguage].count}</label>
                    <input type="number" name="${type}-count" value="${record[type]?.count || ''}" min="0">
                </div>
        `;
        
        html += `
            </div>
        `;
    });
    
    // 评分
    html += `
                <div class="form-group">
                    <label>${translations[currentLanguage].score}</label>
                    <input type="number" name="score" value="${record.score || ''}" min="0" max="100">
                </div>
            </div>
            <div class="form-actions">
                <button type="button" onclick="cancelEdit()">${translations[currentLanguage].cancel}</button>
                <button type="submit">${translations[currentLanguage].save}</button>
            </div>
            </form>
        </div>
    </div>
    `;
    
    // 添加到页面
    document.body.insertAdjacentHTML('beforeend', html);
    
    // 显示模态框
    const editModal = document.getElementById('edit-modal');
    editModal.style.display = 'block';
    
    // 绑定关闭按钮事件
    editModal.querySelector('.close').addEventListener('click', cancelEdit);
    
    // 点击模态框外部关闭
    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) {
            cancelEdit();
        }
    });
    

    
    // 绑定表单提交事件
    document.getElementById('exercise-form').addEventListener('submit', saveRecord);
}

// 取消编辑
function cancelEdit() {
    const editModal = document.getElementById('edit-modal');
    if (editModal) {
        editModal.remove();
    }
    
    // 同时清理旧的表单容器（如果存在）
    const oldForm = document.getElementById('exercise-form');
    if (oldForm) {
        const formContainer = oldForm.closest('.form-container');
        if (formContainer) {
            formContainer.remove();
        }
    }
}

// 显示新增数据表单
function showAddForm() {
    // 检查是否为管理员
    if (!isAdmin) {
        alert('只有cjw已登录才能够添加数据');
        return;
    }
    
    // 检查是否已存在编辑模态框，如果存在则移除
    const existingModal = document.getElementById('edit-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 创建编辑模态框
    let html = `
        <div id="edit-modal" class="modal">
            <div class="modal-content" style="width: 90%; max-width: 800px; max-height: 80vh; overflow-y: auto;">
                <span class="close">&times;</span>
                <h2>${translations[currentLanguage].addRecord}</h2>
                <form id="exercise-form">
                    <div class="form-group">
                        <label>${translations[currentLanguage].date}</label>
                        <input type="date" name="date" required>
                    </div>
                    <div class="form-grid">
        `;
    
    // 添加运动项目表单
    Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
        html += `
            <div class="exercise-section">
                <h4>${exerciseTypes[currentLanguage][type]}</h4>
        `;
        
        // 只对跳绳和滑板显示时长字段
        if (durationTypes.includes(type)) {
            html += `
                <div class="form-group">
                    <label>${translations[currentLanguage].duration}</label>
                    <input type="number" name="${type}-duration" value="" min="0" step="0.5">
                </div>
            `;
        }
        
        // 对所有运动显示数量字段
        html += `
                <div class="form-group">
                    <label>${translations[currentLanguage].count}</label>
                    <input type="number" name="${type}-count" value="" min="0">
                </div>
        `;
        
        html += `
            </div>
        `;
    });
    
    html += `
                </div>
                <div class="form-actions">
                    <button type="button" onclick="cancelEdit()">${translations[currentLanguage].cancel}</button>
                    <button type="submit">${translations[currentLanguage].save}</button>
                </div>
                </form>
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.insertAdjacentHTML('beforeend', html);
    
    // 显示模态框
    const editModal = document.getElementById('edit-modal');
    editModal.style.display = 'block';
    
    // 绑定关闭按钮事件
    editModal.querySelector('.close').addEventListener('click', cancelEdit);
    
    // 点击模态框外部关闭
    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) {
            cancelEdit();
        }
    });
    

    
    // 绑定表单提交事件
    document.getElementById('exercise-form').addEventListener('submit', saveRecord);
}

// 保存记录
function saveRecord(e) {
    e.preventDefault();
    
    // 检查是否为管理员
    if (!isAdmin) {
        alert('只有cjw已登录才能够修改数据');
        return;
    }
    
    const formData = new FormData(e.target);
    const date = formData.get('date');
    
    // 创建记录对象，只保留需要的字段
    const record = {
        date: date.toString(),
        skipping: {
            duration: formData.get('skipping-duration') || '',
            count: formData.get('skipping-count') || ''
        },
        dumbbellCurl: {
            count: formData.get('dumbbellCurl-count') || ''
        },
        dumbbellRow: {
            count: formData.get('dumbbellRow-count') || ''
        },
        running: {
            count: formData.get('running-count') || ''
        },
        walking: {
            count: formData.get('walking-count') || ''
        },
        sitUps: {
            count: formData.get('sitUps-count') || ''
        },
        skateboarding: {
            duration: formData.get('skateboarding-duration') || '',
            count: formData.get('skateboarding-count') || ''
        },
        gluteBridge: {
            count: formData.get('gluteBridge-count') || ''
        },
        score: formData.get('score') || ''
    };
    
    // 保存到本地存储（暂时不计算分数）
    exerciseData[date] = record;
    localStorage.setItem('exerciseData', JSON.stringify(exerciseData));
    
    // 重新计算最近30天的所有分数
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    Object.entries(exerciseData).forEach(([dateStr, dayRecord]) => {
        const recordDate = new Date(dateStr);
        if (recordDate >= thirtyDaysAgo && recordDate <= today) {
            // 重新计算分数
            const newScore = calculateScore(dayRecord);
            exerciseData[dateStr].score = newScore;
        }
    });
    
    // 保存更新后的分数到本地存储
    localStorage.setItem('exerciseData', JSON.stringify(exerciseData));
    
    // 获取更新后的记录
    const updatedRecord = exerciseData[date];
    
    // 生成保存内容的HTML
    let savedContent = `<h3>${date}</h3>`;
    
    // 添加跳绳数据
    if (updatedRecord.skipping.duration || updatedRecord.skipping.count) {
        savedContent += `<div class="save-item"><strong>${exerciseTypes[currentLanguage].skipping}:</strong> `;
        if (updatedRecord.skipping.duration) savedContent += `${updatedRecord.skipping.duration} ${currentLanguage === 'zh' ? '分钟' : 'minutes'}`;
        if (updatedRecord.skipping.count) savedContent += `, ${updatedRecord.skipping.count} ${currentLanguage === 'zh' ? '个' : 'ropes'}`;
        savedContent += `</div>`;
    }
    
    // 添加其他运动数据
    Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
        if (type !== 'skipping' && type !== 'skateboarding') {
            if (updatedRecord[type] && updatedRecord[type].count) {
                savedContent += `<div class="save-item"><strong>${exerciseTypes[currentLanguage][type]}:</strong> ${updatedRecord[type].count} ${type === 'walking' ? (currentLanguage === 'zh' ? '步' : 'steps') : (currentLanguage === 'zh' ? '次' : 'times')}</div>`;
            }
        }
    });
    
    // 添加滑板数据
    if (updatedRecord.skateboarding.duration || updatedRecord.skateboarding.count) {
        savedContent += `<div class="save-item"><strong>${exerciseTypes[currentLanguage].skateboarding}:</strong> `;
        if (updatedRecord.skateboarding.duration) savedContent += `${updatedRecord.skateboarding.duration} ${currentLanguage === 'zh' ? '分钟' : 'minutes'}`;
        if (updatedRecord.skateboarding.count) savedContent += `, ${updatedRecord.skateboarding.count} ${currentLanguage === 'zh' ? '次' : 'times'}`;
        savedContent += `</div>`;
    }
    
    // 添加评分
    if (updatedRecord.score) {
        savedContent += `<div class="save-item"><strong>${translations[currentLanguage].score}:</strong> ${updatedRecord.score}/100</div>`;
    }
    
    // 显示保存内容
    document.getElementById('save-content').innerHTML = savedContent;
    document.getElementById('save-modal').style.display = 'block';
    
    // 重新渲染日历
    renderCalendar();
    
    // 重新渲染其他部分
    renderDashboard();
    renderTable();
    renderTimeline();
    renderStatistics();
    
    // 移除表单
    cancelEdit();
}

// 计算评分
function calculateScore(record) {
    // 计算当天的运动总量
    let dailyTotal = 0;
    let exerciseCount = 0;
    
    // 估算每种运动的卡路里消耗
    const calorieRates = {
        skipping: 0.1, // 每个（次）跳绳0.1大卡
        skateboarding: 8, // 每分钟8大卡
        running: 0.12, // 每次0.12大卡（估算）
        walking: 0.05, // 每次0.05大卡（估算）
        sitUps: 0.5, // 每次0.5大卡
        gluteBridge: 0.4, // 每次0.4大卡
        dumbbellCurl: 0.3, // 每次0.3大卡
        dumbbellRow: 0.35 // 每次0.35大卡
    };
    
    // 计算当天的卡路里消耗
    let dailyCalories = 0;
    Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
        const exercise = record[type];
        if (exercise) {
            if (exercise.duration || exercise.count || exercise.steps || exercise.distance) {
                exerciseCount++;
                
                // 计算卡路里消耗
                if (exercise.duration) {
                    dailyCalories += exercise.duration * (calorieRates[type] || 5);
                }
                if (exercise.count) {
                    dailyCalories += exercise.count * (calorieRates[type] || 0.2);
                }
                if (exercise.steps) {
                    dailyCalories += exercise.steps * 0.04; // 每步0.04大卡
                }
                if (exercise.distance) {
                    dailyCalories += exercise.distance * 60; // 每公里60大卡
                }
            }
        }
    });
    
    // 计算最近30天的平均值
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    let totalCalories = 0;
    let totalDays = 0;
    Object.entries(exerciseData).forEach(([dateStr, dayRecord]) => {
        const date = new Date(dateStr);
        if (date >= thirtyDaysAgo && date <= today) {
            let dayCalories = 0;
            Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
                const exercise = dayRecord[type];
                if (exercise) {
                    if (exercise.duration) {
                        dayCalories += exercise.duration * (calorieRates[type] || 5);
                    }
                    if (exercise.count) {
                        dayCalories += exercise.count * (calorieRates[type] || 0.2);
                    }
                    if (exercise.steps) {
                        dayCalories += exercise.steps * 0.04;
                    }
                    if (exercise.distance) {
                        dayCalories += exercise.distance * 60;
                    }
                }
            });
            if (dayCalories > 0) {
                totalCalories += dayCalories;
                totalDays++;
            }
        }
    });
    
    // 计算平均值
    const avgCalories = totalDays > 0 ? totalCalories / totalDays : 300; // 默认平均值300大卡
    
    // 计算基础分40分
    let score = 40;
    
    // 根据卡路里消耗与平均值的比例调整分数
    if (dailyCalories > 0) {
        // 如果达到平均值的30%以上，开始加分
        if (dailyCalories >= avgCalories * 0.3) {
            // 最高可加60分
            const calorieRatio = Math.min(dailyCalories / avgCalories, 3); // 最多三倍平均值
            const extraScore = (calorieRatio - 0.3) * (60 / 2.7); // 从0.3到3倍，对应0到60分
            score += extraScore;
        }
    }
    
    // 确保分数在0-100之间
    return Math.max(0, Math.min(Math.round(score), 100));
}

// 显示记录详情
function showRecordDetail(dateStr) {
    const record = exerciseData[dateStr];
    if (!record) return;
    
    let html = `
        <div class="form-container">
            <h3>${record.date}</h3>
            <div class="statistics-grid">
    `;
    
    Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
        const exercise = record[type];
        if (exercise.duration) {
            html += `
                <div class="statistics-card">
                    <h3>${exerciseTypes[currentLanguage][type]}</h3>
                    <div class="statistics-item">
                        <span>${translations[currentLanguage].duration}</span>
                        <span>${exercise.duration} 分钟</span>
                    </div>
            `;
            
            if (exercise.count) {
                html += `
                    <div class="statistics-item">
                        <span>${translations[currentLanguage].count}</span>
                        <span>${exercise.count}</span>
                    </div>
                `;
            }
            
            if (exercise.steps) {
                html += `
                    <div class="statistics-item">
                        <span>${translations[currentLanguage].steps}</span>
                        <span>${exercise.steps}</span>
                    </div>
                `;
            }
            
            if (exercise.distance) {
                html += `
                    <div class="statistics-item">
                        <span>${translations[currentLanguage].distance}</span>
                        <span>${exercise.distance} 公里</span>
                    </div>
                `;
            }
            
            html += `</div>`;
        }
    });
    
    if (record.score) {
        html += `
            <div class="statistics-card">
                <h3>${translations[currentLanguage].score}</h3>
                <div class="rating">
                    <span class="rating-value">${record.score}/100</span>
                </div>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    // 添加到日历部分
    const calendarSection = document.getElementById('calendar');
    calendarSection.insertAdjacentHTML('beforeend', html);
}

// 渲染表格
function renderTable() {
    const container = document.querySelector('.table-container');
    // 过滤出有数据的日期，空数据不显示
    const dates = Object.keys(exerciseData).filter(date => {
        const record = exerciseData[date];
        // 检查是否有任何运动数据
        let hasData = false;
        Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
            const exercise = record[type];
            if (exercise.duration || exercise.count || exercise.steps || exercise.distance) {
                hasData = true;
            }
        });
        return hasData;
    }).sort().reverse();
    
    // 添加新增日期按钮和表格
    let html = '';
    if (isAdmin) {
        html += `
            <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <button onclick="addNewDateRow()" style="padding: 10px 20px; background-color: #333; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    ${currentLanguage === 'zh' ? '新增日期' : 'New Date'}
                </button>
            </div>
        `;
    }
    
    if (dates.length === 0 && !isAdmin) {
        container.innerHTML = html + `<p>${translations[currentLanguage].noData}</p>`;
        return;
    }
    
    // 计算分页信息
    const totalPages = Math.ceil(dates.length / tableItemsPerPage);
    const startIndex = (tableCurrentPage - 1) * tableItemsPerPage;
    const endIndex = startIndex + tableItemsPerPage;
    const paginatedDates = dates.slice(startIndex, endIndex);
    
    html += `
        <table class="data-table">
            <thead>
                <tr>
                    <th>${translations[currentLanguage].date}</th>
                    <th>${translations[currentLanguage].score}</th>
    `;
    
    // 添加运动项目表头
    Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
        html += `<th>${exerciseTypes[currentLanguage][type]}</th>`;
    });
    
    // 添加操作列
    html += `<th>${currentLanguage === 'zh' ? '操作' : 'Actions'}</th>`;
    
    html += `
                </tr>
            </thead>
            <tbody id="table-body">
    `;
    
    // 添加数据行
    paginatedDates.forEach(date => {
        const record = exerciseData[date];
        html += `
            <tr data-date="${date}">
                <td>${date}</td>
                <td>${record.score || ''}</td>
        `;
        
        Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
            const exercise = record[type];
            // 对于需要时长的运动，显示时长和数量
            if (durationTypes.includes(type)) {
                const duration = exercise.duration ? exercise.duration : '';
                const count = exercise.count ? exercise.count : '';
                html += `
                    <td>
                        <div class="exercise-display">
                            <span class="duration-value">${duration}</span>
                            <span class="count-value">${count}</span>
                        </div>
                    </td>
                `;
            } else {
                // 对于其他运动，只显示数量
                const count = exercise.count ? exercise.count : '';
                html += `
                    <td>
                        <span class="count-value">${count}</span>
                    </td>
                `;
            }
        });
        
        // 添加编辑和保存按钮
        if (isAdmin) {
            html += `
                    <td>
                        <div class="action-buttons">
                            <button onclick="editRow('${date}')" class="edit-btn" style="padding: 5px 10px; background-color: #333; color: white; border: none; border-radius: 3px; cursor: pointer; margin-right: 5px;">
                                ${currentLanguage === 'zh' ? '修改' : 'Edit'}
                            </button>
                            <button onclick="saveRow('${date}')" class="save-btn" style="padding: 5px 10px; background-color: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer; display: none;">
                                ${currentLanguage === 'zh' ? '保存' : 'Save'}
                            </button>
                        </div>
                    </td>
            `;
        } else {
            html += `<td></td>`;
        }
        html += `
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    // 添加分页控件
    if (totalPages > 1) {
        html += `
            <div style="margin-top: 20px; display: flex; justify-content: center; align-items: center; gap: 10px;">
                <button onclick="changeTablePage(${Math.max(1, tableCurrentPage - 1)})" style="padding: 5px 10px; border: 1px solid #000; background-color: transparent; cursor: pointer;">
                    ${currentLanguage === 'zh' ? '上一页' : 'Prev'}
                </button>
                <span style="font-size: 0.9rem;">
                    ${tableCurrentPage} / ${totalPages}
                </span>
                <button onclick="changeTablePage(${Math.min(totalPages, tableCurrentPage + 1)})" style="padding: 5px 10px; border: 1px solid #000; background-color: transparent; cursor: pointer;">
                    ${currentLanguage === 'zh' ? '下一页' : 'Next'}
                </button>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// 更改表格页码
function changeTablePage(page) {
    tableCurrentPage = page;
    renderTable();
}



// 添加新日期行
function addNewDateRow() {
    // 检查是否为管理员
    if (!isAdmin) {
        alert('只有cjw已登录才能够添加数据');
        return;
    }
    
    const tableBody = document.getElementById('table-body');
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // 创建新行HTML
    let newRowHtml = `
        <tr data-date="new" class="new-row">
            <td><input type="date" value="${todayStr}" class="date-input" style="width: 100%"></td>
            <td><input type="number" value="" min="0" max="100" class="score-input" style="width: 100%"></td>
    `;
    
    // 添加运动项目输入框
    Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
        if (durationTypes.includes(type)) {
            newRowHtml += `
                <td>
                    <div class="inline-edit">
                        <input type="number" class="duration-input" data-type="${type}-duration" value="" min="0" step="0.5" placeholder="${translations[currentLanguage].duration}" style="width: 45%; margin-right: 10%">
                        <input type="number" class="count-input" data-type="${type}-count" value="" min="0" placeholder="${translations[currentLanguage].count}" style="width: 45%">
                    </div>
                </td>
            `;
        } else {
            newRowHtml += `
                <td>
                    <input type="number" class="count-input" data-type="${type}-count" value="" min="0" placeholder="${translations[currentLanguage].count}" style="width: 100%">
                </td>
            `;
        }
    });
    
    // 添加保存按钮
    newRowHtml += `
                <td>
                    <button onclick="saveNewDateRow(this.closest('tr'))" style="padding: 5px 10px; background-color: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        ${currentLanguage === 'zh' ? '保存' : 'Save'}
                    </button>
                </td>
            </tr>
        `;
    
    // 添加到表格顶部
    tableBody.insertAdjacentHTML('afterbegin', newRowHtml);
}

// 保存新日期行数据
function saveNewDateRow(row) {
    const dateInput = row.querySelector('.date-input');
    const date = dateInput.value;
    
    // 创建记录对象
    const record = {
        date: date,
        skipping: { duration: '', count: '' },
        dumbbellCurl: { count: '' },
        dumbbellRow: { count: '' },
        running: { count: '' },
        walking: { count: '' },
        sitUps: { count: '' },
        skateboarding: { duration: '', count: '' },
        gluteBridge: { count: '' },
        score: ''
    };
    
    // 填充运动数据
    row.querySelectorAll('.duration-input, .count-input').forEach(input => {
        const type = input.dataset.type;
        const value = input.value;
        if (type.includes('-duration')) {
            const exerciseType = type.split('-')[0];
            record[exerciseType].duration = value;
        } else if (type.includes('-count')) {
            const exerciseType = type.split('-')[0];
            record[exerciseType].count = value;
        }
    });
    
    // 检查是否有数据
    let hasData = false;
    Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
        const exercise = record[type];
        if (exercise.duration || exercise.count) {
            hasData = true;
        }
    });
    
    if (hasData) {
        // 计算分数
        record.score = calculateScore(record);
        
        // 保存到exerciseData
        exerciseData[date] = record;
        localStorage.setItem('exerciseData', JSON.stringify(exerciseData));
        
        // 重新计算最近30天的分数
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        Object.entries(exerciseData).forEach(([dateStr, dayRecord]) => {
            const recordDate = new Date(dateStr);
            if (recordDate >= thirtyDaysAgo && recordDate <= today) {
                const newScore = calculateScore(dayRecord);
                exerciseData[dateStr].score = newScore;
            }
        });
        
        localStorage.setItem('exerciseData', JSON.stringify(exerciseData));
        
        // 重新渲染表格
        renderTable();
    } else {
        // 没有数据，移除行
        row.remove();
    }
}

// 编辑行
function editRow(date) {
    if (!isAdmin) {
        alert('只有cjw已登录才能够修改数据');
        return;
    }
    
    const row = document.querySelector(`tr[data-date="${date}"]`);
    const record = exerciseData[date];
    
    // 更新日期单元格
    row.cells[0].innerHTML = `<input type="date" value="${date}" class="date-input" style="width: 100%"></input>`;
    
    // 更新分数单元格
    row.cells[1].innerHTML = `<input type="number" value="${record.score || ''}" min="0" max="100" class="score-input" style="width: 100%"></input>`;
    
    // 更新运动数据单元格
    let cellIndex = 2;
    Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
        const exercise = record[type];
        if (durationTypes.includes(type)) {
            // 对于需要时长的运动，显示时长和数量输入框
            const duration = exercise.duration ? exercise.duration : '';
            const count = exercise.count ? exercise.count : '';
            row.cells[cellIndex].innerHTML = `
                <div class="inline-edit">
                    <input type="number" class="duration-input" data-type="${type}-duration" value="${duration}" min="0" step="0.5" placeholder="${translations[currentLanguage].duration}" style="width: 45%; margin-right: 10%">
                    <input type="number" class="count-input" data-type="${type}-count" value="${count}" min="0" placeholder="${translations[currentLanguage].count}" style="width: 45%">
                </div>
            `;
        } else {
            // 对于其他运动，只显示数量输入框
            const count = exercise.count ? exercise.count : '';
            row.cells[cellIndex].innerHTML = `
                <input type="number" class="count-input" data-type="${type}-count" value="${count}" min="0" placeholder="${translations[currentLanguage].count}" style="width: 100%">
            `;
        }
        cellIndex++;
    });
    
    // 更新操作按钮
    const actionCell = row.cells[cellIndex];
    actionCell.innerHTML = `
        <button onclick="saveRow('${date}')" style="padding: 5px 10px; background-color: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">
            ${currentLanguage === 'zh' ? '保存' : 'Save'}
        </button>
    `;
}

// 保存行数据
function saveRow(date) {
    if (!isAdmin) {
        alert('只有cjw已登录才能够修改数据');
        return;
    }
    
    const row = document.querySelector(`tr[data-date="${date}"]`);
    const dateInput = row.querySelector('.date-input');
    const newDate = dateInput.value;
    
    // 获取现有记录
    const record = exerciseData[date];
    
    // 更新运动数据
    row.querySelectorAll('.duration-input, .count-input').forEach(input => {
        const type = input.dataset.type;
        const value = input.value;
        if (type.includes('-duration')) {
            const exerciseType = type.split('-')[0];
            record[exerciseType].duration = value;
        } else if (type.includes('-count')) {
            const exerciseType = type.split('-')[0];
            record[exerciseType].count = value;
        }
    });
    
    // 检查是否有数据
    let hasData = false;
    Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
        const exercise = record[type];
        if (exercise.duration || exercise.count) {
            hasData = true;
        }
    });
    
    if (hasData) {
        // 如果日期改变，需要删除旧日期的记录
        if (newDate !== date) {
            delete exerciseData[date];
            record.date = newDate;
            exerciseData[newDate] = record;
        }
        
        // 计算分数
        record.score = calculateScore(record);
        
        // 保存到exerciseData
        localStorage.setItem('exerciseData', JSON.stringify(exerciseData));
        
        // 重新计算最近30天的分数
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        Object.entries(exerciseData).forEach(([dateStr, dayRecord]) => {
            const recordDate = new Date(dateStr);
            if (recordDate >= thirtyDaysAgo && recordDate <= today) {
                const newScore = calculateScore(dayRecord);
                exerciseData[dateStr].score = newScore;
            }
        });
        
        localStorage.setItem('exerciseData', JSON.stringify(exerciseData));
        
        // 重新渲染表格
        renderTable();
    } else {
        // 没有数据，从exerciseData中删除
        delete exerciseData[date];
        localStorage.setItem('exerciseData', JSON.stringify(exerciseData));
        
        // 重新渲染表格
        renderTable();
    }
}



// 渲染Timeline
function renderTimeline() {
    const container = document.querySelector('.timeline-container');
    const dates = Object.keys(exerciseData).sort().reverse();
    
    if (dates.length === 0) {
        container.innerHTML = `<p>${translations[currentLanguage].noData}</p>`;
        return;
    }
    
    // 计算分页信息
    const totalPages = Math.ceil(dates.length / timelineItemsPerPage);
    const startIndex = (timelineCurrentPage - 1) * timelineItemsPerPage;
    const endIndex = startIndex + timelineItemsPerPage;
    const paginatedDates = dates.slice(startIndex, endIndex);
    
    let html = '';
    
    paginatedDates.forEach(date => {
        const record = exerciseData[date];
        let exerciseDetails = '';
        
        Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
            const exercise = record[type];
            let details = [];
            
            if (exercise.duration) details.push(`${exercise.duration}${currentLanguage === 'zh' ? '分钟' : 'minutes'}`);
            if (exercise.count) {
                let unit = type === 'walking' ? (currentLanguage === 'zh' ? '步' : 'steps') : 
                           type === 'skipping' ? (currentLanguage === 'zh' ? '个' : 'ropes') : 
                           (currentLanguage === 'zh' ? '次' : 'times');
                details.push(`${exercise.count}${unit}`);
            }
            if (exercise.steps) details.push(`${exercise.steps}${currentLanguage === 'zh' ? '步' : 'steps'}`);
            if (exercise.distance) details.push(`${exercise.distance}${currentLanguage === 'zh' ? '公里' : 'km'}`);
            
            if (details.length > 0) {
                exerciseDetails += `<p><strong>${exerciseTypes[currentLanguage][type]}:</strong> ${details.join(', ')}</p>`;
            }
        });
        
        if (exerciseDetails) {
            html += `
                <div class="timeline-item">
                    <div class="timeline-date">${date}</div>
                    <div class="timeline-content">
                        ${record.score ? `<h4>${translations[currentLanguage].score}: ${record.score}/100</h4>` : ''}
                        ${exerciseDetails}
                    </div>
                </div>
            `;
        }
    });
    
    // 添加分页控件
    if (totalPages > 1) {
        html += `
            <div style="margin-top: 40px; display: flex; justify-content: center; align-items: center; gap: 10px;">
                <button onclick="changeTimelinePage(${Math.max(1, timelineCurrentPage - 1)})" style="padding: 5px 10px; border: 1px solid #000; background-color: transparent; cursor: pointer;">
                    ${currentLanguage === 'zh' ? '上一页' : 'Prev'}
                </button>
                <span style="font-size: 0.9rem;">
                    ${timelineCurrentPage} / ${totalPages}
                </span>
                <button onclick="changeTimelinePage(${Math.min(totalPages, timelineCurrentPage + 1)})" style="padding: 5px 10px; border: 1px solid #000; background-color: transparent; cursor: pointer;">
                    ${currentLanguage === 'zh' ? '下一页' : 'Next'}
                </button>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// 更改Timeline页码
function changeTimelinePage(page) {
    timelineCurrentPage = page;
    renderTimeline();
}

// 渲染统计分析
function renderStatistics() {
    const container = document.querySelector('.statistics-container');
    const dates = Object.keys(exerciseData);
    
    if (dates.length === 0) {
        container.innerHTML = `<p>${translations[currentLanguage].noData}</p>`;
        return;
    }
    
    // 计算统计数据
    const stats = {};
    Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
        stats[type] = {
            duration: { total: 0, count: 0 },
            count: { total: 0, count: 0 },
            steps: { total: 0, count: 0 },
            distance: { total: 0, count: 0 }
        };
    });
    
    // 汇总数据
    dates.forEach(date => {
        const record = exerciseData[date];
        Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
            const exercise = record[type];
            if (exercise.duration) {
                stats[type].duration.total += parseFloat(exercise.duration);
                stats[type].duration.count++;
            }
            if (exercise.count) {
                stats[type].count.total += parseInt(exercise.count);
                stats[type].count.count++;
            }
            if (exercise.steps) {
                stats[type].steps.total += parseInt(exercise.steps);
                stats[type].steps.count++;
            }
            if (exercise.distance) {
                stats[type].distance.total += parseFloat(exercise.distance);
                stats[type].distance.count++;
            }
        });
    });
    
    let html = `<div class="statistics-grid">`;
    
    // 生成统计卡片
    Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
        const stat = stats[type];
        let hasData = false;
        Object.values(stat).forEach(item => {
            if (item.count > 0) hasData = true;
        });
        
        if (hasData) {
            html += `
                <div class="statistics-card">
                    <h3>${exerciseTypes[currentLanguage][type]}</h3>
            `;
            
            if (stat.duration.count > 0) {
                html += `
                    <div class="statistics-item">
                        <span>${translations[currentLanguage].duration} ${translations[currentLanguage].total}</span>
                        <span>${stat.duration.total.toFixed(1)} 分钟</span>
                    </div>
                    <div class="statistics-item">
                        <span>${translations[currentLanguage].duration} ${translations[currentLanguage].average}</span>
                        <span>${(stat.duration.total / stat.duration.count).toFixed(1)} 分钟</span>
                    </div>
                `;
            }
            
            if (stat.count.count > 0) {
                html += `
                    <div class="statistics-item">
                        <span>${translations[currentLanguage].count} ${translations[currentLanguage].total}</span>
                        <span>${stat.count.total} 次</span>
                    </div>
                    <div class="statistics-item">
                        <span>${translations[currentLanguage].count} ${translations[currentLanguage].average}</span>
                        <span>${Math.round(stat.count.total / stat.count.count)} 次</span>
                    </div>
                `;
            }
            
            if (stat.steps.count > 0) {
                html += `
                    <div class="statistics-item">
                        <span>${translations[currentLanguage].steps} ${translations[currentLanguage].total}</span>
                        <span>${stat.steps.total} 步</span>
                    </div>
                    <div class="statistics-item">
                        <span>${translations[currentLanguage].steps} ${translations[currentLanguage].average}</span>
                        <span>${Math.round(stat.steps.total / stat.steps.count)} 步</span>
                    </div>
                `;
            }
            
            if (stat.distance.count > 0) {
                html += `
                    <div class="statistics-item">
                        <span>${translations[currentLanguage].distance} ${translations[currentLanguage].total}</span>
                        <span>${stat.distance.total.toFixed(1)} 公里</span>
                    </div>
                    <div class="statistics-item">
                        <span>${translations[currentLanguage].distance} ${translations[currentLanguage].average}</span>
                        <span>${(stat.distance.total / stat.distance.count).toFixed(1)} 公里</span>
                    </div>
                `;
            }
            
            html += `</div>`;
        }
    });
    
    html += `</div>`;
    container.innerHTML = html;
}

// 提交登录
function submitLogin() {
    const password = document.getElementById('password').value;
    if (password === '188560') {
        isAdmin = true;
        document.getElementById('login-modal').style.display = 'none';
        
        // 直接手动设置按钮显示状态，确保登出按钮显示
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const exportExcelBtn = document.getElementById('export-excel');
        const importExcelBtn = document.getElementById('import-excel');
        
        if (loginBtn) {
            loginBtn.style.display = 'none';
        }
        
        if (logoutBtn) {
            logoutBtn.style.display = 'inline-block';
        }
        
        if (exportExcelBtn) {
            exportExcelBtn.style.display = 'inline-block';
        }
        
        if (importExcelBtn) {
            importExcelBtn.style.display = 'inline-block';
        }
        
        // 更新Excel按钮文本
        updateExcelButtonText();
        
        // 显示登录成功提示
        alert(translations[currentLanguage].loginSuccess);
        
        // 延迟渲染页面，确保isAdmin状态完全更新
        setTimeout(() => {
            // 重新渲染页面，确保所有其他UI状态都更新
            renderPage();
            
            // 显示图片上传和查看块
            const imageUploadSection = document.getElementById('image-upload-section');
            if (imageUploadSection) {
                imageUploadSection.style.display = 'block';
                console.log('Image upload section displayed');
            }
            
            // 初始化图片上传功能
            initImageUpload();
            
            // 加载保存的图片
            loadSavedImage();
        }, 200);

    } else {
        alert(translations[currentLanguage].loginFailed);
    }
}

// 初始化图片上传功能
function initImageUpload() {
    const imageUpload = document.getElementById('image-upload');
    const saveImageBtn = document.getElementById('save-image-btn');
    const clearImageBtn = document.getElementById('clear-image-btn');
    const viewImage = document.getElementById('view-image');
    const imageFeedback = document.getElementById('image-feedback');
    
    if (!imageUpload || !saveImageBtn || !viewImage) return;
    
    // 图片状态
    let imageState = {
        scale: 1,
        x: 0,
        y: 0,
        isDragging: false,
        startX: 0,
        startY: 0,
        isSaved: false // 标记图片是否已经保存
    };
    
    // 显示反馈信息
    function showFeedback(message, duration = 2000) {
        if (imageFeedback) {
            imageFeedback.textContent = message;
            imageFeedback.style.display = 'block';
            setTimeout(() => {
                imageFeedback.style.display = 'none';
            }, duration);
        }
    }
    
    // 图片上传事件
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            showFeedback('Uploading image...');
            
            const reader = new FileReader();
            reader.onload = function(e) {
                viewImage.src = e.target.result;
                saveImageBtn.style.display = 'inline-block';
                if (clearImageBtn) clearImageBtn.style.display = 'inline-block';
                
                // 重置图片状态
                imageState = {
                    scale: 1,
                    x: 0,
                    y: 0,
                    isDragging: false,
                    startX: 0,
                    startY: 0,
                    isSaved: false // 重置保存状态
                };
                
                // 调整图片大小，确保在页面内完整显示
                adjustImageSize(false); // 传入isSaved参数
                
                showFeedback('Image uploaded successfully!');
            };
            reader.onerror = function() {
                showFeedback('Error uploading image.');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 保存图片事件
    saveImageBtn.addEventListener('click', function() {
        const imageData = viewImage.src;
        if (imageData) {
            localStorage.setItem('savedImage', imageData);
            imageState.isSaved = true; // 标记图片已经保存
            showFeedback('Image saved successfully!');
            
            // 禁用图片的调整大小功能
            if (viewImage) {
                viewImage.style.pointerEvents = 'none'; // 禁用鼠标事件
            }
        }
    });
    
    // 清除图片事件
    if (clearImageBtn) {
        clearImageBtn.addEventListener('click', function() {
            viewImage.src = '';
            saveImageBtn.style.display = 'none';
            clearImageBtn.style.display = 'none';
            
            // 重置图片状态
            imageState = {
                scale: 1,
                x: 0,
                y: 0,
                isDragging: false,
                startX: 0,
                startY: 0,
                isSaved: false // 重置保存状态
            };
            
            // 清除保存的图片
            localStorage.removeItem('savedImage');
            showFeedback('Image cleared successfully!');
        });
    }
    
    // 图片查看功能 - 支持鼠标拖动查看大图
    viewImage.addEventListener('mousedown', function(e) {
        if (imageState.isSaved) return; // 如果图片已经保存，不允许拖动
        
        imageState.isDragging = true;
        imageState.startX = e.clientX - imageState.x;
        imageState.startY = e.clientY - imageState.y;
        viewImage.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!imageState.isDragging || imageState.isSaved) return; // 如果图片已经保存，不允许拖动
        
        e.preventDefault();
        imageState.x = e.clientX - imageState.startX;
        imageState.y = e.clientY - imageState.startY;
        
        // 应用变换
        applyImageTransform();
    });
    
    document.addEventListener('mouseup', function() {
        imageState.isDragging = false;
        viewImage.style.cursor = imageState.isSaved ? 'default' : 'grab';
    });
    
    // 图片查看功能 - 支持鼠标滚轮缩放
    viewImage.addEventListener('wheel', function(e) {
        if (imageState.isSaved) return; // 如果图片已经保存，不允许缩放
        
        e.preventDefault();
        const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
        imageState.scale = Math.max(0.5, Math.min(5, imageState.scale * scaleFactor));
        
        // 应用变换
        applyImageTransform();
    });
    
    // 应用图片变换
    function applyImageTransform() {
        viewImage.style.transform = `translate(${imageState.x}px, ${imageState.y}px) scale(${imageState.scale})`;
    }
}


// 调整图片大小，确保在页面内完整显示
function adjustImageSize() {
    const viewImage = document.getElementById('view-image');
    const imageContainer = document.querySelector('.image-container');
    
    if (!viewImage || !imageContainer) return;
    
    const containerWidth = imageContainer.clientWidth;
    const containerHeight = imageContainer.clientHeight;
    
    // 保存原始onload事件，确保不会覆盖
    const originalOnLoad = viewImage.onload;
    
    viewImage.onload = function() {
        // 调用原始onload事件
        if (typeof originalOnLoad === 'function') {
            originalOnLoad.call(this);
        }
        
        const imageWidth = viewImage.naturalWidth;
        const imageHeight = viewImage.naturalHeight;
        const imageRatio = imageWidth / imageHeight;
        const containerRatio = containerWidth / containerHeight;
        
        if (imageRatio > containerRatio) {
            // 图片比容器宽，按宽度缩放
            viewImage.style.width = '100%';
            viewImage.style.height = 'auto';
        } else {
            // 图片比容器高，按高度缩放
            viewImage.style.width = 'auto';
            viewImage.style.height = '100%';
        }
        
        // 重置变换
        viewImage.style.transform = 'none';
    };
    
    // 强制触发onload事件（如果图片已经加载）
    if (viewImage.complete) {
        viewImage.onload();
    }
}

// 加载保存的图片
function loadSavedImage() {
    const viewImage = document.getElementById('view-image');
    const saveImageBtn = document.getElementById('save-image-btn');
    const clearImageBtn = document.getElementById('clear-image-btn');
    const uploadBtn = document.querySelector('.upload-btn');
    
    if (!viewImage) return;
    
    const savedImage = localStorage.getItem('savedImage');
    if (savedImage) {
        viewImage.src = savedImage;
        
        // 只有在用户已经登录时才显示上传按钮和保存按钮
        if (isAdmin) {
            if (saveImageBtn) saveImageBtn.style.display = 'inline-block';
            if (clearImageBtn) clearImageBtn.style.display = 'inline-block';
            if (uploadBtn) uploadBtn.style.display = 'inline-block';
        } else {
            // 在未登录状态下，隐藏上传按钮和保存按钮
            if (saveImageBtn) saveImageBtn.style.display = 'none';
            if (clearImageBtn) clearImageBtn.style.display = 'none';
            if (uploadBtn) uploadBtn.style.display = 'none';
        }
        
        // 调整图片大小，确保在页面内完整显示
        adjustImageSize();
    }
}

// 登出时保持图片显示，只隐藏上传和保存按钮
function logout() {
    isAdmin = false;
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const exportExcelBtn = document.getElementById('export-excel');
    const importExcelBtn = document.getElementById('import-excel');
    const imageUploadSection = document.getElementById('image-upload-section');
    const saveImageBtn = document.getElementById('save-image-btn');
    const clearImageBtn = document.getElementById('clear-image-btn');
    const imageUpload = document.getElementById('image-upload');
    
    if (loginBtn) {
        loginBtn.style.display = 'inline-block';
    }
    
    if (logoutBtn) {
        logoutBtn.style.display = 'none';
    }
    
    if (exportExcelBtn) {
        exportExcelBtn.style.display = 'none';
    }
    
    if (importExcelBtn) {
        importExcelBtn.style.display = 'none';
    }
    
    // 保持图片上传块显示，但隐藏上传和保存按钮
    if (imageUploadSection) {
        imageUploadSection.style.display = 'block';
        
        // 隐藏上传按钮和保存按钮
        if (saveImageBtn) saveImageBtn.style.display = 'none';
        if (clearImageBtn) clearImageBtn.style.display = 'none';
        if (imageUpload) imageUpload.style.display = 'none';
    }
    
    // 更新Excel按钮文本
    updateExcelButtonText();
    
    // 显示登出成功提示
    alert(translations[currentLanguage].logoutSuccess || '登出成功');
    
    // 重新渲染页面，确保所有UI状态都更新
    renderPage();
}

// 更新Excel按钮文本
function updateExcelButtonText() {
    const exportExcelBtn = document.getElementById('export-excel');
    const importExcelBtn = document.getElementById('import-excel');
    const importModalTitle = document.querySelector('#import-modal h2');
    const confirmImportBtn = document.getElementById('confirm-import');
    
    if (exportExcelBtn) {
        exportExcelBtn.textContent = translations[currentLanguage].exportExcel;
    }
    
    if (importExcelBtn) {
        importExcelBtn.textContent = translations[currentLanguage].importExcel;
    }
    
    if (importModalTitle) {
        importModalTitle.textContent = translations[currentLanguage].importExcel;
    }
    
    if (confirmImportBtn) {
        confirmImportBtn.textContent = translations[currentLanguage].confirmImport;
    }
}

// 导出Excel
function exportExcel() {
    if (!isAdmin) {
        alert('不是CJW，不能上传和下载');
        return;
    }
    
    const dates = Object.keys(exerciseData).sort();
    
    // 创建数据对象数组
    const data = dates.map(date => {
        const record = exerciseData[date];
        const row = {
            [translations[currentLanguage].date]: date, // 直接使用字符串日期，避免时区问题
            [translations[currentLanguage].score]: record.score || ''
        };
        
        Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
            const exercise = record[type];
            // 只导出数值数据
            if (durationTypes.includes(type)) {
                // 对于需要时长的运动，分别导出时长和数量
                row[`${exerciseTypes[currentLanguage][type]}_duration`] = exercise.duration || '';
                row[`${exerciseTypes[currentLanguage][type]}_count`] = exercise.count || '';
            } else {
                // 对于其他运动，只导出数量
                row[exerciseTypes[currentLanguage][type]] = exercise.count || '';
            }
        });
        
        return row;
    });
    
    // 添加空白行用于新增日期
    const blankRow = {
        [translations[currentLanguage].date]: '',
        [translations[currentLanguage].score]: ''
    };
    Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
        if (durationTypes.includes(type)) {
            blankRow[`${exerciseTypes[currentLanguage][type]}_duration`] = '';
            blankRow[`${exerciseTypes[currentLanguage][type]}_count`] = '';
        } else {
            blankRow[exerciseTypes[currentLanguage][type]] = '';
        }
    });
    data.push(blankRow);
    
    // 使用json_to_sheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Exercise Records');
    
    // 生成文件名，使用当前日期
    const fileName = `exercise-records-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}

// 将Excel序列号或Date对象转换为日期字符串（使用北京时间UTC+8）
function excelSerialToDate(serial) {
    if (typeof serial === 'number') {
        // Excel的起始日期是1900年1月1日
        // 注意：Excel认为1900年是闰年，所以从1899-12-30开始
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        // 计算UTC时间戳
        const utcTime = excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000;
        // 转换为北京时间（UTC+8）
        const beijingTime = utcTime + 8 * 60 * 60 * 1000;
        const beijingDate = new Date(beijingTime);
        // 使用UTC方法获取日期部分，确保不受本地时区影响
        const year = beijingDate.getUTCFullYear();
        const month = String(beijingDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(beijingDate.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } else if (serial instanceof Date) {
        // 如果是Date对象，转换为北京时间（UTC+8）
        const beijingTime = serial.getTime() + 8 * 60 * 60 * 1000;
        const beijingDate = new Date(beijingTime);
        // 使用UTC方法获取日期部分，确保不受本地时区影响
        const year = beijingDate.getUTCFullYear();
        const month = String(beijingDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(beijingDate.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } else if (typeof serial === 'string') {
        // 如果是字符串，尝试多种解析方式
        // 尝试直接解析
        let date = new Date(serial);
        
        // 如果解析失败，尝试手动解析常见格式
        if (isNaN(date.getTime())) {
            // 尝试 YYYY-MM-DD 格式
            const ymdMatch = serial.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
            if (ymdMatch) {
                const [, year, month, day] = ymdMatch;
                date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
            }
            // 尝试 MM/DD/YYYY 格式
            else if (serial.match(/^(\d{1,2})[/](\d{1,2})[/](\d{4})$/)) {
                const [, month, day, year] = serial.match(/^(\d{1,2})[/](\d{1,2})[/](\d{4})$/);
                date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
            }
        }
        
        if (!isNaN(date.getTime())) {
            // 转换为北京时间（UTC+8）
            const beijingTime = date.getTime() + 8 * 60 * 60 * 1000;
            const beijingDate = new Date(beijingTime);
            // 使用UTC方法获取日期部分，确保不受本地时区影响
            const year = beijingDate.getUTCFullYear();
            const month = String(beijingDate.getUTCMonth() + 1).padStart(2, '0');
            const day = String(beijingDate.getUTCDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    }
    return serial;
}

// 显示导入预览
function showImportPreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            // 生成预览HTML
            let previewHTML = '<table class="preview-table">';
            previewHTML += '<thead>';
            previewHTML += '<tr>';
            previewHTML += '<th>日期</th>';
            previewHTML += '<th>评分</th>';
            previewHTML += '<th>跳绳</th>';
            previewHTML += '<th>滑板</th>';
            previewHTML += '<th>其他运动</th>';
            previewHTML += '</tr>';
            previewHTML += '</thead>';
            previewHTML += '<tbody>';
            
            // 最多显示前5行预览
            const previewData = jsonData.slice(0, 5);
            previewData.forEach(row => {
                // 尝试多种可能的日期列名
                let date = row[translations.zh.date] || row[translations.en.date] || row['Date'] || row['日期'] || row['date'] || row['DATE'];
                // 转换Excel序列号为日期字符串
                date = excelSerialToDate(date);
                
                // 检查日期是否有效（格式为YYYY-MM-DD）
                const isValidDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);
                
                // 处理评分
                const score = row[translations.zh.score] || row[translations.en.score] || row['Score'] || row['评分'] || row['score'] || row['SCORE'] || '';
                
                previewHTML += '<tr>';
                previewHTML += `<td>${isValidDate ? date : '无效日期'}</td>`;
                previewHTML += `<td>${score}</td>`;
                
                // 跳绳数据
                let skippingData = '';
                const skippingNames = [
                    exerciseTypes.zh.skipping,
                    exerciseTypes.en.skipping,
                    'skipping',
                    'skipping_duration',
                    'skipping_count'
                ];
                
                for (const name of skippingNames) {
                    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
                        skippingData += row[name] + ' ';
                    }
                }
                previewHTML += `<td>${skippingData.trim() || ''}</td>`;
                
                // 滑板数据
                let skateboardingData = '';
                const skateboardingNames = [
                    exerciseTypes.zh.skateboarding,
                    exerciseTypes.en.skateboarding,
                    'skateboarding',
                    'skateboarding_duration',
                    'skateboarding_count'
                ];
                
                for (const name of skateboardingNames) {
                    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
                        skateboardingData += row[name] + ' ';
                    }
                }
                previewHTML += `<td>${skateboardingData.trim() || ''}</td>`;
                
                // 其他运动数据预览
                let otherExercises = [];
                Object.keys(exerciseTypes.zh).forEach(type => {
                    if (type !== 'skipping' && type !== 'skateboarding') {
                        const exerciseNames = [
                            exerciseTypes.zh[type],
                            exerciseTypes.en[type],
                            type
                        ];
                        
                        for (const name of exerciseNames) {
                            if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
                                otherExercises.push(`${exerciseTypes[currentLanguage][type]}: ${row[name]}`);
                                break;
                            }
                        }
                    }
                });
                previewHTML += `<td>${otherExercises.length > 0 ? otherExercises.slice(0, 2).join('<br>') + (otherExercises.length > 2 ? '...' : '') : ''}</td>`;
                previewHTML += '</tr>';
            });
            
            if (jsonData.length > 5) {
                previewHTML += '<tr>';
                previewHTML += `<td colspan="5" style="text-align: center; font-style: italic;">... 共 ${jsonData.length} 条记录，仅显示前 5 条</td>`;
                previewHTML += '</tr>';
            }
            
            previewHTML += '</tbody>';
            previewHTML += '</table>';
            
            // 显示预览
            document.getElementById('preview-content').innerHTML = previewHTML;
            document.getElementById('import-preview').style.display = 'block';
        } catch (error) {
            document.getElementById('error-message').textContent = '文件解析错误: ' + error.message;
            document.getElementById('error-message').style.display = 'block';
            document.getElementById('import-preview').style.display = 'none';
        }
    };
    
    reader.onerror = function() {
        document.getElementById('error-message').textContent = '文件读取失败，请检查文件格式';
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('import-preview').style.display = 'none';
    };
    
    reader.readAsArrayBuffer(file);
}

// 导入Excel
function importExcel() {
    if (!isAdmin) {
        alert('不是CJW，不能上传和下载');
        return;
    }
    
    const fileInput = document.getElementById('excel-file');
    const file = fileInput.files[0];
    if (!file) {
        document.getElementById('error-message').textContent = '请选择Excel文件';
        document.getElementById('error-message').style.display = 'block';
        return;
    }
    
    // 显示加载指示器
    document.getElementById('loading-indicator').style.display = 'block';
    document.getElementById('error-message').style.display = 'none';
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            let importedCount = 0;
            let skippedCount = 0;
            
            // 处理导入的数据
            jsonData.forEach(row => {
                try {
                    // 尝试多种可能的日期列名
                    let date = row[translations.zh.date] || row[translations.en.date] || row['Date'] || row['日期'] || row['date'] || row['DATE'];
                    // 转换Excel序列号为日期字符串
                    date = excelSerialToDate(date);
                    
                    // 检查日期是否有效（格式为YYYY-MM-DD）
                    const isValidDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);
                    
                    if (isValidDate) {
                        const record = {
                            date: date,
                            skipping: { duration: '', count: '' },
                            dumbbellCurl: { count: '' },
                            dumbbellRow: { count: '' },
                            running: { count: '' },
                            walking: { count: '' },
                            sitUps: { count: '' },
                            skateboarding: { duration: '', count: '' },
                            gluteBridge: { count: '' },
                            score: ''
                        };
                        
                        // 处理评分
                        const score = row[translations.zh.score] || row[translations.en.score] || row['Score'] || row['评分'] || row['score'] || row['SCORE'];
                        if (score !== undefined && score !== null && score !== '') {
                            // 确保评分是数值
                            const numScore = parseFloat(score);
                            if (!isNaN(numScore)) {
                                record.score = Math.round(numScore);
                            }
                        }
                        
                        // 填充运动数据
                        Object.keys(exerciseTypes.zh).forEach(type => {
                            // 尝试多种列名格式
                            const exerciseNames = [
                                exerciseTypes.zh[type],
                                exerciseTypes.en[type],
                                type,
                                type.toLowerCase(),
                                type.toUpperCase()
                            ];
                            
                            let foundData = false;
                            
                            // 尝试新格式：分开的时长和数量列
                            if (durationTypes.includes(type)) {
                                // 尝试多种时长列名
                                const durationKeys = exerciseNames.map(name => `${name}_duration`);
                                const countKeys = exerciseNames.map(name => `${name}_count`);
                                
                                for (const key of durationKeys) {
                                    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
                                        const duration = parseFloat(row[key]);
                                        if (!isNaN(duration)) {
                                            record[type].duration = duration.toString();
                                            foundData = true;
                                            break;
                                        }
                                    }
                                }
                                
                                for (const key of countKeys) {
                                    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
                                        const count = parseInt(row[key]);
                                        if (!isNaN(count)) {
                                            record[type].count = count.toString();
                                            foundData = true;
                                        }
                                    }
                                }
                            }
                            
                            // 如果没有找到新格式数据，尝试旧格式
                            if (!foundData) {
                                for (const name of exerciseNames) {
                                    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
                                        let value = row[name];
                                        
                                        if (typeof value === 'string') {
                                            if (durationTypes.includes(type)) {
                                                // 对于需要时长的运动，尝试解析空格分隔的时长和数量
                                                const parts = value.split(/\s+/);
                                                // 处理时长（第一部分）
                                                if (parts.length >= 1) {
                                                    const durationStr = parts[0].replace(/[^0-9.-]/g, '');
                                                    const duration = parseFloat(durationStr);
                                                    if (!isNaN(duration)) {
                                                        record[type].duration = duration.toString();
                                                        foundData = true;
                                                    }
                                                }
                                                // 处理数量（第二部分）
                                                if (parts.length >= 2) {
                                                    const countStr = parts[1].replace(/[^0-9.-]/g, '');
                                                    const count = parseInt(countStr);
                                                    if (!isNaN(count)) {
                                                        record[type].count = count.toString();
                                                        foundData = true;
                                                    }
                                                }
                                            } else {
                                                // 对于其他运动，只处理数量
                                                const countStr = value.replace(/[^0-9.-]/g, '');
                                                const count = parseInt(countStr);
                                                if (!isNaN(count)) {
                                                    record[type].count = count.toString();
                                                    foundData = true;
                                                }
                                            }
                                        } else {
                                            // 值已经是数字
                                            if (durationTypes.includes(type)) {
                                                // 假设是时长
                                                const duration = parseFloat(value);
                                                if (!isNaN(duration)) {
                                                    record[type].duration = duration.toString();
                                                    foundData = true;
                                                }
                                            } else {
                                                // 假设是数量
                                                const count = parseInt(value);
                                                if (!isNaN(count)) {
                                                    record[type].count = count.toString();
                                                    foundData = true;
                                                }
                                            }
                                        }
                                        
                                        if (foundData) break;
                                    }
                                }
                            }
                        });
                        
                        // 检查是否有数据
                        let hasData = false;
                        Object.keys(exerciseTypes.zh).forEach(type => {
                            const exercise = record[type];
                            if (exercise.duration || exercise.count) {
                                hasData = true;
                            }
                        });
                        
                        if (hasData) {
                            // 计算评分（如果未填写）
                            if (!record.score) {
                                record.score = calculateScore(record);
                            }
                            
                            // 保存数据
                            exerciseData[date] = record;
                            importedCount++;
                        } else {
                            skippedCount++;
                        }
                    } else {
                        skippedCount++;
                    }
                } catch (error) {
                    console.error('Error processing row:', error);
                    skippedCount++;
                }
            });
            
            // 重新计算最近30天的所有分数
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            
            Object.entries(exerciseData).forEach(([dateStr, dayRecord]) => {
                const recordDate = new Date(dateStr);
                if (recordDate >= thirtyDaysAgo && recordDate <= today) {
                    // 重新计算分数
                    const newScore = calculateScore(dayRecord);
                    exerciseData[dateStr].score = newScore;
                }
            });
            
            // 保存到本地存储
            localStorage.setItem('exerciseData', JSON.stringify(exerciseData));
            
            // 重新渲染页面
            renderDashboard();
            renderPage();
            
            // 隐藏加载指示器
            document.getElementById('loading-indicator').style.display = 'none';
            
            // 关闭模态框
            document.getElementById('import-modal').style.display = 'none';
            
            // 重置表单
            fileInput.value = '';
            document.getElementById('file-name').textContent = '点击上传Excel文件';
            document.getElementById('import-preview').style.display = 'none';
            
            // 显示成功消息
            alert(`Excel导入成功\n导入记录: ${importedCount}\n跳过记录: ${skippedCount}\n已更新最近30天的运动分数`);

        } catch (error) {
            // 隐藏加载指示器
            document.getElementById('loading-indicator').style.display = 'none';
            
            // 显示错误消息
            document.getElementById('error-message').textContent = '导入失败: ' + error.message;
            document.getElementById('error-message').style.display = 'block';
            console.error('Import error:', error);
        }
    };
    
    reader.onerror = function() {
        // 隐藏加载指示器
        document.getElementById('loading-indicator').style.display = 'none';
        
        // 显示错误消息
        document.getElementById('error-message').textContent = '文件读取失败，请检查文件格式';
        document.getElementById('error-message').style.display = 'block';
    };
    
    // 设置读取超时（5分钟）
    setTimeout(() => {
        if (reader.readyState === 1) { // LOADING
            reader.abort();
            document.getElementById('loading-indicator').style.display = 'none';
            document.getElementById('error-message').textContent = '文件读取超时，请尝试较小的文件';
            document.getElementById('error-message').style.display = 'block';
        }
    }, 300000); // 5分钟
    
    reader.readAsArrayBuffer(file);
}

// 渲染Dashboard
function renderDashboard() {
    const container = document.querySelector('.dashboard-container');
    console.log('Dashboard容器:', container);
    
    // 检查容器是否存在
    if (!container) {
        console.error('Dashboard容器不存在');
        return;
    }
    
    console.log('Exercise数据:', exerciseData);
    
    const allDates = Object.keys(exerciseData).sort().reverse();
    console.log('所有日期:', allDates);
    
    // 计算30天前的日期
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    console.log('30天前日期:', thirtyDaysAgo);
    
    // 过滤出最近30天的日期
    const dates = allDates.filter(dateStr => {
        const date = new Date(dateStr);
        return date >= thirtyDaysAgo && date <= today;
    });
    console.log('最近30天日期:', dates);


    
    const totalDays = dates.length;
    
    // 计算总评分
    let totalScore = 0;
    dates.forEach(date => {
        const record = exerciseData[date];
        if (record.score) {
            totalScore += parseInt(record.score);
        }
    });
    const avgScore = totalDays > 0 ? Math.round(totalScore / totalDays) : 0;
    
    // 计算每个运动项目的累计数据
    const exerciseStats = {};
    Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
        exerciseStats[type] = {
            total: 0,
            weekly: {},
            data: []
        };
    });
    
    // 生成近期一周的日期
    const weeklyDates = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        // 使用本地时间生成日期字符串，确保北京时间一致性
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        weeklyDates.push(dateStr);
    }
    
    // 计算每周每天的卡路里消耗
    const weeklyCalories = {};
    weeklyDates.forEach(dateStr => {
        const record = exerciseData[dateStr];
        let totalCalories = 0;
        const userWeight = 70; // kg
        
        if (record) {
            // 计算每种运动的卡路里消耗
            const calorieRates = {
                skipping: 0.1, // 每个（次）跳绳0.1大卡
                skateboarding: 8, // 每分钟8大卡
                running: 0.12, // 每次0.12大卡（估算）
                walking: 0.05, // 每次0.05大卡（估算）
                sitUps: 0.5, // 每次0.5大卡
                gluteBridge: 0.4, // 每次0.4大卡
                dumbbellCurl: 0.3, // 每次0.3大卡
                dumbbellRow: 0.35 // 每次0.35大卡
            };
            
            Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
                const exercise = record[type];
                if (exercise) {
                    if (exercise.duration) {
                        totalCalories += exercise.duration * (calorieRates[type] || 5) * (userWeight / 70);
                    }
                    if (exercise.count) {
                        totalCalories += exercise.count * (calorieRates[type] || 0.2) * (userWeight / 70);
                    }
                    if (exercise.steps) {
                        totalCalories += exercise.steps * 0.04 * (userWeight / 70);
                    }
                    if (exercise.distance) {
                        totalCalories += exercise.distance * 60 * (userWeight / 70);
                    }
                }
            });
        }
        
        weeklyCalories[dateStr] = Math.round(totalCalories);
    });
    
    // 填充运动数据
    dates.forEach(date => {
        const record = exerciseData[date];
        
        Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
            const exercise = record[type];
            if (exercise) {
                if (durationTypes.includes(type)) {
                    // 对于需要时长的运动，累计时长
                    if (exercise.duration) {
                        exerciseStats[type].total += parseFloat(exercise.duration);
                    }
                } else {
                    // 对于其他运动，累计数量
                    if (exercise.count) {
                        exerciseStats[type].total += parseInt(exercise.count);
                    }
                }
                
                // 填充近期一周的数据
                if (weeklyDates.includes(date)) {
                    if (durationTypes.includes(type)) {
                        exerciseStats[type].weekly[date] = exercise.duration || 0;
                    } else {
                        exerciseStats[type].weekly[date] = exercise.count || 0;
                    }
                }
            }
        });
    });
    
    // 生成Dashboard HTML
    let html = `
        <div class="dashboard-section">
            <!-- Balenciaga style banner -->
            <div class="balenciaga-banner">
                <div class="banner-row">
                    <div class="banner-content">
                        <span class="banner-label">DATE:</span>
                        <span class="banner-value" id="current-date"></span>
                        <span class="banner-separator">|</span>
                        <span class="banner-label">TIME:</span>
                        <span class="banner-value" id="current-time"></span>
                        <span class="banner-separator">|</span>
                        <span class="banner-label">STEPS:</span>
                        <span class="banner-value" id="today-steps"></span>
                        <span class="banner-separator">|</span>
                        <span class="banner-label">TODAY MISSING EXERCISES:</span>
                        <span class="banner-value" id="today-exercises"></span>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-grid">
                <!-- 当天运动情况卡片 -->
                <div class="dashboard-card today-card">
                    <h3 style="font-size: 0.6rem;">Today</h3>
                    <div class="today-content">
                        <!-- 当天运动数据将通过JavaScript生成 -->
                    </div>
                </div>
                
                <!-- 卡路里消耗分布卡片 -->
                <div class="dashboard-card">
                    <h3 style="font-size: 0.6rem;">TODAY Calorie Distribution</h3>
                    <div class="card-chart glass-effect">
                        <canvas id="today-calorie-chart"></canvas>
                    </div>
                </div>

                <!-- 每周卡路里热图卡片 -->
                <div class="dashboard-card">
                    <h3 style="font-size: 0.6rem;">Weekly Calorie Heatmap</h3>
                    <div class="calorie-heatmap">
                        <div class="heatmap-grid">
                            ${weeklyDates.map(dateStr => {
                                const calories = weeklyCalories[dateStr] || 0;
                                // 计算比例
                                const maxCalories = 800; // 假设最大卡路里消耗为800
                                const maxScore = 100; // 最大分数
                                const minSize = 35; // 最小尺寸
                                const maxSize = 65; // 最大尺寸
                                
                                // 获取当天的分数
                                const score = exerciseData[dateStr]?.score || 0;
                                
                                // 计算大小比例（基于分数）
                                const sizeRatio = Math.min(score / maxScore, 1);
                                const size = Math.max(minSize, minSize + (maxSize - minSize) * sizeRatio);
                                
                                // 计算灰度值比例（基于卡路里）
                                const grayRatio = Math.min(calories / maxCalories, 1);
                                const grayValue = Math.max(180, 255 - 180 * grayRatio); // 255为白色，75为深灰色
                                const opacity = Math.max(0.5, 0.4 + 0.6 * grayRatio); // 透明度从0.4到1.0
                                
                                // 格式化日期显示
                                const date = new Date(dateStr);
                                const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
                                const day = date.getDate();
                                
                                // 格式化月历日期显示
                                const monthDay = date.getDate();
                                const monthName = date.toLocaleString('default', { month: 'short' });
                                
                                return `
                                    <div class="heatmap-cell" style="width: ${size}px; height: ${size}px; background: rgba(${grayValue}, ${grayValue}, ${grayValue}, ${opacity});" title="${dateStr}: ${calories} kcal, Score: ${score}">
                                        <div class="cell-date">${monthName}</div>
                                        <div class="cell-day">${monthDay}</div>
                                        <div class="cell-weekday">${dayOfWeek.substring(0, 2)}</div>
                                        <div class="cell-value">${calories}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <div class="heatmap-legend">
                            <div class="legend-item">
                                <div class="legend-color low"></div>
                                <span>Low</span>
                            </div>
                            <div class="legend-item">
                                <div class="legend-color medium"></div>
                                <span>Medium</span>
                            </div>
                            <div class="legend-item">
                                <div class="legend-color high"></div>
                                <span>High</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="dashboard-card">
                    <h3>Average Score</h3>
                    <div class="card-value">${avgScore}</div>
                    <div class="card-chart">
                        <canvas id="score-chart"></canvas>
                    </div>
                </div>
    `;
    
    // 添加每个运动项目的卡片
    Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
        const stat = exerciseStats[type];
        const unit = durationTypes.includes(type) ? (currentLanguage === 'zh' ? '分钟' : 'minutes') : (currentLanguage === 'zh' ? '次' : 'times');
        
        // 检查最近一周是否有运动数据
        const hasWeeklyData = weeklyDates.some(date => {
            const value = parseFloat(stat.weekly[date] || 0);
            return value > 0;
        });
        
        // 只有有数据的运动项目才显示
        if (hasWeeklyData) {
            const displayUnit = type === 'walking' ? 'steps' : unit;
            
            if (type === 'walking') {
                // 对于步行，使用带玻璃效果的柱状图
                html += `
                        <div class="dashboard-card">
                            <h3>${exerciseTypes[currentLanguage][type]}</h3>
                            <div class="card-value">${stat.total.toFixed(0)} ${displayUnit}</div>
                            <div class="card-chart glass-effect">
                                <canvas id="${type}-chart"></canvas>
                            </div>
                        </div>
                `;
            } else {
                // 对于其他运动，使用下拉框显示
                html += `
                        <div class="dashboard-card">
                            <h3>${exerciseTypes[currentLanguage][type]}</h3>
                            <div class="card-value">${stat.total.toFixed(durationTypes.includes(type) ? 1 : 0)} ${displayUnit}</div>
                            <div class="exercise-dropdown">
                                <div class="dropdown-header">
                                    <span>Details</span>
                                    <span>▼</span>
                                </div>
                                <div class="dropdown-content">
                                    <div class="weekly-data">
                                        <h4>Total</h4>
                                        <div class="daily-item">
                                            <span>Total</span>
                                            <span>${stat.total.toFixed(durationTypes.includes(type) ? 1 : 0)} ${displayUnit}</span>
                                        </div>
                                        <h4>Weekly Data</h4>
                                        <div class="daily-data">
                `;
                
                // 添加近期一周的数据，只显示有运动的日期
                weeklyDates.forEach(date => {
                    const value = parseFloat(stat.weekly[date] || 0);
                    if (value > 0) {
                        html += `
                                            <div class="daily-item">
                                                <span>${date}</span>
                                                <span>${value.toFixed(durationTypes.includes(type) ? 1 : 0)} ${displayUnit}</span>
                                            </div>
                        `;
                    }
                });
                
                html += `
                                        </div>
                                    </div>
                                    <div class="card-chart">
                                        <canvas id="${type}-chart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                `;
            }
        }
    });
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // 生成周日历
    generateWeeklyCalendar();
    
    // 生成当天运动情况
    generateTodayOverview();
    
    // 绑定下拉菜单事件
    document.querySelectorAll('.dropdown-header').forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            this.classList.toggle('active');
            content.classList.toggle('active');
            this.querySelector('span:last-child').textContent = this.classList.contains('active') ? '▲' : '▼';
        });
    });
    
    // 初始化图表
    initCharts(exerciseStats, weeklyDates, totalDays);
    
    // 初始化当天运动图表
    initTodayCharts();
    
    // 初始化横幅
    initBanner();
}

// 初始化图表
function initCharts(exerciseStats, weeklyDates, totalDays) {
    // 总运动天数图表
    const daysCtx = document.getElementById('days-chart');
    if (daysCtx) {
        new Chart(daysCtx, {
            type: 'line',
            data: {
                labels: weeklyDates,
                datasets: [{
                    label: 'Days',
                    data: weeklyDates.map(date => exerciseData[date] ? 1 : 0),
                    borderColor: '#000',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // 平均评分图表
    const scoreCtx = document.getElementById('score-chart');
    if (scoreCtx) {
        new Chart(scoreCtx, {
            type: 'line',
            data: {
                labels: weeklyDates,
                datasets: [{
                    label: 'Score',
                    data: weeklyDates.map(date => exerciseData[date] ? exerciseData[date].score || 0 : 0),
                    borderColor: '#000',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // 每个运动项目的图表
    Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
        const ctx = document.getElementById(`${type}-chart`);
        if (ctx) {
            const chartType = type === 'walking' ? 'bar' : 'line';
            const chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            };
            
            if (type === 'walking') {
                chartOptions.scales = {
                    y: {
                        beginAtZero: true
                    }
                };
            }
            
            new Chart(ctx, {
                type: chartType,
                data: {
                    labels: weeklyDates,
                    datasets: [{
                        label: exerciseTypes[currentLanguage][type],
                        data: weeklyDates.map(date => exerciseStats[type].weekly[date] || 0),
                        borderColor: '#000',
                        backgroundColor: type === 'walking' ? 'rgba(100, 100, 100, 0.6)' : 'rgba(0, 0, 0, 0.1)',
                        tension: 0.4
                    }]
                },
                options: chartOptions
            });
        }
    });
}

// 生成周日历
function generateWeeklyCalendar() {
    const calendarContainer = document.querySelector('.weekly-calendar');
    if (!calendarContainer) return;
    
    // 生成近期一周的日期
    const weeklyDates = [];
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    // 确保exerciseData已初始化
    const safeExerciseData = window.exerciseData || JSON.parse(localStorage.getItem('exerciseData')) || {};
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        weeklyDates.push({
            date: date,
            dateStr: dateStr,
            hasData: safeExerciseData[dateStr] !== undefined,
            isToday: dateStr === todayStr
        });
    }
    
    // 生成日历HTML（横向排列，有运动记录的日子圈出来）
    let calendarHtml = `
        <div class="mini-calendar">
            <div class="mini-calendar-weekdays">
                ${weeklyDates.map(day => {
                    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
                    return `<div class="mini-weekday">${weekdays[day.date.getDay()]}</div>`;
                }).join('')}
            </div>
            <div class="mini-calendar-days">
                ${weeklyDates.map(day => {
                    return `
                        <div class="mini-calendar-day ${day.hasData ? 'has-data' : ''} ${day.isToday ? 'today' : ''}">
                            ${day.date.getDate()}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    calendarContainer.innerHTML = calendarHtml;
}

// 生成当天运动情况
function generateTodayOverview() {
    const todayContent = document.querySelector('.today-content');
    if (!todayContent) return;
    
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    // 确保exerciseData已初始化
    const safeExerciseData = window.exerciseData || JSON.parse(localStorage.getItem('exerciseData')) || {};
    const todayRecord = safeExerciseData[todayStr];
    
    // 用户信息
    const userHeight = 184; // cm
    const userWeight = 70; // kg
    
    // 计算基础代谢率 (BMR) 使用Harris-Benedict公式
    function calculateBMR(weight, height, age = 30, gender = 'male') {
        if (gender === 'male') {
            return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }
    }
    
    // 计算运动卡路里消耗
    function calculateExerciseCalories(exercise, type, weight) {
        const calorieRates = {
            skipping: 0.1, // 每个（次）跳绳0.1大卡
            skateboarding: 8, // 每分钟8大卡
            running: 0.12, // 每次12大卡（估算）
            walking: 0.05, // 每次0.05大卡（估算）
            sitUps: 0.5, // 每次0.5大卡
            gluteBridge: 0.4, // 每次0.4大卡
            dumbbellCurl: 0.3, // 每次0.3大卡
            dumbbellRow: 0.35 // 每次0.35大卡
        };
        
        let calories = 0;
        if (exercise.duration) {
            calories += exercise.duration * (calorieRates[type] || 5) * (weight / 70); // 根据体重调整
        }
        if (exercise.count) {
            calories += exercise.count * (calorieRates[type] || 0.2) * (weight / 70); // 根据体重调整
        }
        if (exercise.steps) {
            calories += exercise.steps * 0.04 * (weight / 70); // 每步0.04大卡
        }
        if (exercise.distance) {
            calories += exercise.distance * 60 * (weight / 70); // 每公里60大卡
        }
        return Math.round(calories);
    }
    
    const bmr = Math.round(calculateBMR(userWeight, userHeight));
    let totalCalories = 0;
    let exerciseDetails = '';
    
    if (todayRecord) {
        Object.keys(exerciseTypes.en).forEach(type => {
            const exercise = todayRecord[type];
            if (exercise && (exercise.duration || exercise.count || exercise.steps || exercise.distance)) {
                const calories = calculateExerciseCalories(exercise, type, userWeight);
                totalCalories += calories;
                
                exerciseDetails += `
                    <div class="exercise-detail" style="font-size: 0.6rem; padding: 5px 0;">
                        <span>${exerciseTypes.en[type]}</span>
                        <span>${exercise.count || exercise.duration || exercise.steps || exercise.distance} ${exercise.count ? 'times' : exercise.duration ? 'minutes' : exercise.steps ? 'steps' : 'km'}</span>
                        <span>${calories} kcal</span>
                    </div>
                `;
            }
        });
    }
    
    // 生成当天运动情况HTML
    let overviewHtml = `
        <div class="today-stats">
            <h4 style="font-size: 0.6rem; margin-bottom: 15px;">Exercise Data</h4>
            <div class="stats-grid" style="font-size: 0.7rem;">
                <div class="stat-item">
                    <span class="stat-label">Total Calories Burned</span>
                    <span class="stat-value">${totalCalories} kcal</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Exercise Types</span>
                    <span class="stat-value">${todayRecord ? Object.keys(exerciseTypes.en).filter(type => todayRecord[type] && (todayRecord[type].duration || todayRecord[type].count || todayRecord[type].steps || todayRecord[type].distance)).length : 0}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Metabolic Calories</span>
                    <span class="stat-value">${bmr} kcal</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Consumption</span>
                    <span class="stat-value">${totalCalories + bmr} kcal</span>
                </div>
            </div>
        </div>
        <div class="exercise-details">
            <h4 style="font-size: 0.6rem; margin-bottom: 15px;">Detailed Exercise Data</h4>
            ${exerciseDetails || '<p style="font-size: 0.7rem;">No exercise records for today</p>'}
        </div>
    `;
    
    todayContent.innerHTML = overviewHtml;
}

// 初始化当天运动图表
function initTodayCharts() {
    // 卡路里消耗分布图表
    const calorieCtx = document.getElementById('today-calorie-chart');
    if (calorieCtx) {
        // 设置画布大小
        calorieCtx.width = 200;
        calorieCtx.height = 200;
        
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        // 确保exerciseData已初始化
        const safeExerciseData = window.exerciseData || JSON.parse(localStorage.getItem('exerciseData')) || {};
        const todayRecord = safeExerciseData[todayStr];
        
        // 即使没有今天的记录，也显示一个默认图表
        const exerciseData = [];
        const exerciseLabels = [];
        const userWeight = 70; // kg
        
        if (todayRecord) {
            // 计算每种运动的卡路里消耗
            const calorieRates = {
                skipping: 0.1, // 每个（次）跳绳0.1大卡
                skateboarding: 8,
                running: 0.12,
                walking: 0.05,
                sitUps: 0.5,
                gluteBridge: 0.4,
                dumbbellCurl: 0.3,
                dumbbellRow: 0.35
            };
            
            Object.keys(exerciseTypes[currentLanguage]).forEach(type => {
                const exercise = todayRecord[type];
                if (exercise && (exercise.duration || exercise.count || exercise.steps || exercise.distance)) {
                    let calories = 0;
                    if (exercise.duration) {
                        calories += exercise.duration * (calorieRates[type] || 5) * (userWeight / 70);
                    }
                    if (exercise.count) {
                        calories += exercise.count * (calorieRates[type] || 0.2) * (userWeight / 70);
                    }
                    if (exercise.steps) {
                        calories += exercise.steps * 0.04 * (userWeight / 70);
                    }
                    if (exercise.distance) {
                        calories += exercise.distance * 60 * (userWeight / 70);
                    }
                    
                    if (calories > 0) {
                        exerciseLabels.push(exerciseTypes[currentLanguage][type]);
                        exerciseData.push(Math.round(calories));
                    }
                }
            });
        }
        
        // 如果没有数据，显示默认数据
        if (exerciseData.length === 0) {
            exerciseLabels.push('暂无运动');
            exerciseData.push(100);
        }
        
        // 创建圈状图
        new Chart(calorieCtx, {
            type: 'doughnut',
            data: {
                labels: exerciseLabels,
                datasets: [{
                    data: exerciseData,
                    backgroundColor: [
                        'rgba(240, 240, 240, 0.9)',
                        'rgba(220, 220, 220, 0.8)',
                        'rgba(180, 180, 180, 0.7)',
                        'rgba(140, 140, 140, 0.6)',
                        'rgba(100, 100, 100, 0.5)',
                        'rgba(60, 60, 60, 0.4)',
                        'rgba(20, 20, 20, 0.3)',
                        'rgba(0, 0, 0, 0.2)'
                    ],
                    borderColor: 'rgba(240, 240, 240, 0.8)',
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#333',
                            font: {
                                size: 10
                            },
                            padding: 10,
                            boxWidth: 12
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#333',
                        bodyColor: '#666',
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        borderWidth: 1
                    }
                }
            }
        });
    }
}

// 更新横幅内容
function updateBanner() {
    // 更新当前日期
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
        dateElement.textContent = dateStr;
    }
    
    // 更新当前时间
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        timeElement.textContent = timeStr;
    }
    
    // 更新步数
    const stepsElement = document.getElementById('today-steps');
    if (stepsElement) {
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const safeExerciseData = window.exerciseData || JSON.parse(localStorage.getItem('exerciseData')) || {};
        const todayRecord = safeExerciseData[todayStr];
        
        let stepsText = '';
        if (todayRecord && todayRecord.walking && todayRecord.walking.count) {
            stepsText = todayRecord.walking.count + ' steps';
        } else {
            // 显示昨天的步数
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
            const yesterdayRecord = safeExerciseData[yesterdayStr];
            if (yesterdayRecord && yesterdayRecord.walking && yesterdayRecord.walking.count) {
                stepsText = 'Yesterday: ' + yesterdayRecord.walking.count + ' steps';
            } else {
                stepsText = 'No steps recorded';
            }
        }
        
        stepsElement.textContent = stepsText;
    }
    
    // 更新今天未记录的运动
    const exercisesElement = document.getElementById('today-exercises');
    if (exercisesElement) {
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const safeExerciseData = window.exerciseData || JSON.parse(localStorage.getItem('exerciseData')) || {};
        const todayRecord = safeExerciseData[todayStr];
        
        let exercisesText = '';
        if (todayRecord) {
            const missingExercises = [];
            Object.keys(exerciseTypes.en).forEach(type => {
                const exercise = todayRecord[type];
                if (!exercise || (!exercise.duration && !exercise.count && !exercise.steps && !exercise.distance)) {
                    missingExercises.push(exerciseTypes.en[type]);
                }
            });
            exercisesText = missingExercises.length > 0 ? missingExercises.join(' / ') : 'All exercises recorded today';
        } else {
            const allExercises = Object.values(exerciseTypes.en);
            exercisesText = allExercises.join(' / ');
        }
        
        exercisesElement.textContent = exercisesText;
    }
}



// 初始化横幅
function initBanner() {
    updateBanner();
    // 每秒更新一次时间
    setInterval(updateBanner, 1000);
}

// 更新今天的分数
function updateTodayScore() {
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // 检查今天是否有记录
    if (exerciseData[todayStr]) {
        // 计算并更新今天的分数
        const todayRecord = exerciseData[todayStr];
        const todayScore = calculateScore(todayRecord);
        exerciseData[todayStr].score = todayScore;
        localStorage.setItem('exerciseData', JSON.stringify(exerciseData));
        console.log('今天的分数已更新:', todayScore);
    } else {
        console.log('今天暂无记录');
    }
}

// 初始化页面
init();

