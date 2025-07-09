// ในไฟล์ src/contexts/AuthContext.tsx ให้แทนที่ useEffect เดิมด้วยอันนี้

useEffect(() => {
    const updateUserState = async (session: Session | null) => {
      try {
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('users')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          // ถ้ามี Error (เช่น RLS บล็อก) ให้โยน Error ออกไป
          if (error) throw error;

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: profile?.role || 'staff'
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser(null); // เคลียร์ user ถ้าเกิดปัญหา
      } finally {
        // บล็อกนี้จะทำงานเสมอ ไม่ว่าจะสำเร็จหรือล้มเหลว
        setIsLoading(false);
      }
    };

    // เรียกครั้งแรกเพื่อเช็ค session ที่อาจมีอยู่
    supabase.auth.getSession().then(({ data: { session } }) => {
        updateUserState(session);
    });
    
    // ดักฟังการเปลี่ยนแปลง
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        updateUserState(session);
    });

    return () => { authListener.subscription.unsubscribe(); };
}, []);
