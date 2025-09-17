package com.FarmTech.paripakv.service;


import com.FarmTech.paripakv.model.TransportSchedule;
import com.FarmTech.paripakv.repository.TransportScheduleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class TransportScheduleService {

    private final TransportScheduleRepository repo;

    public TransportScheduleService(TransportScheduleRepository repo) {
        this.repo = repo;
    }

    public TransportSchedule createSchedule(TransportSchedule schedule) {
        return repo.save(schedule);
    }

    public List<TransportSchedule> getScheduleByVillage(String village, LocalDate date) {
        return repo.findByVillageNameAndDate(village, date);
    }

    public List<TransportSchedule> getAll() {
        return repo.findAll();
    }
}
