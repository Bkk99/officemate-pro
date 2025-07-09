// ในไฟล์ src/contexts/AuthContext.tsx

const fetchAndSetUserProfile = useCallback(async (session: Session | null) => {
    try {
      if (session?.user) {
        const authUser = session.user;
        
        // ⭐️ Query ใหม่: ดึงข้อมูลจากตาราง 'users' และ 'Employees' ที่เชื่อมกันอยู่
        const { data: profile, error } = await supabase
          .from('users')
          .select(`
            username,
            role,
            employee:Employees (
              first_name,
              last_name,
              department
            )
          `)
          .eq('user_id', authUser.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (profile) {
          // ⭐️ สร้าง user object ใหม่ที่มีข้อมูลครบถ้วน
          const employeeData = Array.isArray(profile.employee) ? profile.employee[0] : profile.employee;

          const userToSet: User = {
            id: authUser.id,
            username: profile.username || authUser.email || '',
            role: profile.role as UserRole,
            // เพิ่ม name และ department เข้าไป โดยมีค่าสำรอง
            name: `${employeeData?.first_name || ''} ${employeeData?.last_name || ''}`.trim() || authUser.email,
            department: employeeData?.department || undefined,
          };
          
          setUser(userToSet);

        } else {
          throw new Error(`Profile not found for user: ${authUser.id}`);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error in fetchAndSetUserProfile:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
