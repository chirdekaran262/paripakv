package com.FarmTech.paripakv.repository;

import com.FarmTech.paripakv.model.TransportSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface TransportScheduleRepository extends JpaRepository<TransportSchedule, UUID> {
    List<TransportSchedule> findByVillageNameAndDate(String villageName, LocalDate date);
}
